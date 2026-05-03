import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Building2, User, Lock, LogOut, ArrowRight, Mail, AlertTriangle, ShieldCheck, Loader2, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/8x228r9hRfo73B26C37Zu0c';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  const [businessDomain, setBusinessDomain] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [personName, setPersonName] = useState('');
  const [personCompany, setPersonCompany] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const callFn = async (name: string, body: any) => {
    if (!isActive) {
      toast.error('You need an active subscription to search.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke(name, { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults({ type: name, data });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
      toast.error(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSearch = () => {
    if (!businessDomain) return toast.error('Enter a company domain');
    if (businessName) {
      const [first, ...rest] = businessName.trim().split(' ');
      callFn('hunter-email-finder', { domain: businessDomain, firstName: first, lastName: rest.join(' ') || first });
    } else {
      callFn('hunter-domain-search', { domain: businessDomain });
    }
  };

  const handlePeopleSearch = () => {
    if (!personName || !personCompany) return toast.error('Enter a name and company');
    const [first, ...rest] = personName.trim().split(' ');
    callFn('hunter-email-finder', { company: personCompany, firstName: first, lastName: rest.join(' ') || first });
  };

  const handleVerify = () => {
    if (!verifyEmail) return toast.error('Enter an email to verify');
    callFn('hunter-email-verify', { email: verifyEmail });
  };

  const handleBulkVerify = () => {
    const emails = bulkEmails
      .split(/[\s,;\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return toast.error('Paste at least one email');
    if (emails.length > 100) return toast.error('Max 100 emails per batch');
    callFn('hunter-email-verify', { emails });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-7 h-7 invert" />
            <span className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Fonatica</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Paywall Banner */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl border border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Subscription Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You need an active Pro subscription to use the email finder. Subscribe now to unlock all features.
                </p>
                <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">
                    Subscribe — $125/mo <ArrowRight className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>Email Finder</h1>
        <p className="text-muted-foreground mb-8">Find verified email addresses for businesses and people.</p>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="business" className="gap-2"><Building2 className="w-4 h-4" /> Business</TabsTrigger>
            <TabsTrigger value="people" className="gap-2"><User className="w-4 h-4" /> People</TabsTrigger>
            <TabsTrigger value="verify" className="gap-2"><ShieldCheck className="w-4 h-4" /> Verify</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4 relative">
              {!isActive && <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Domain</Label>
                  <Input placeholder="example.com" value={businessDomain} onChange={e => setBusinessDomain(e.target.value)} className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Employee Name (optional)</Label>
                  <Input placeholder="John Doe" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-muted" />
                </div>
              </div>
              <Button onClick={handleBusinessSearch} className="w-full sm:w-auto" disabled={!isActive || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Find Email
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="people">
            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4 relative">
              {!isActive && <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Jane Smith" value={personName} onChange={e => setPersonName(e.target.value)} className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input placeholder="Acme Inc." value={personCompany} onChange={e => setPersonCompany(e.target.value)} className="bg-muted" />
                </div>
              </div>
              <Button onClick={handlePeopleSearch} className="w-full sm:w-auto" disabled={!isActive || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Find Email
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="verify">
            <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4 relative">
              {!isActive && <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>}
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input placeholder="hello@example.com" value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} className="bg-muted" />
              </div>
              <Button onClick={handleVerify} className="w-full sm:w-auto" disabled={!isActive || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Verify Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        {results && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-6 p-6 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-accent" />
              <h3 className="font-semibold">Results</h3>
            </div>
            {results.type === 'hunter-domain-search' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{results.data.organization || results.data.domain}</p>
                {(results.data.emails ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No emails found.</p>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {results.data.emails.map((e: any, i: number) => (
                      <li key={i} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{e.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {[e.firstName, e.lastName].filter(Boolean).join(' ')}{e.position ? ` · ${e.position}` : ''}
                          </p>
                        </div>
                        {typeof e.confidence === 'number' && (
                          <span className="text-xs text-accent">{e.confidence}%</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {results.type === 'hunter-email-finder' && (
              results.data.email ? (
                <div>
                  <p className="text-lg font-medium">{results.data.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[results.data.firstName, results.data.lastName].filter(Boolean).join(' ')}
                    {results.data.position ? ` · ${results.data.position}` : ''}
                    {typeof results.data.confidence === 'number' ? ` · ${results.data.confidence}% confidence` : ''}
                  </p>
                </div>
              ) : <p className="text-sm text-muted-foreground">No match found.</p>
            )}
            {results.type === 'hunter-email-verify' && (
              <div>
                <p className="text-lg font-medium">{results.data.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: {results.data.status} · {results.data.deliverable ? 'Deliverable' : 'Not deliverable'}
                  {typeof results.data.confidence === 'number' ? ` · ${results.data.confidence}%` : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
