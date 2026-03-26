import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Search, Users, Zap, Shield, Globe, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/8x228r9hRfo73B26C37Zu0c';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-8 h-8 invert" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Fonatica</span>
          </Link>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 glass text-sm text-muted-foreground mb-8">
            <Zap className="w-3.5 h-3.5 text-accent" /> Find any email in seconds
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: 'Space Grotesk' }}>
            Find the right <span className="gradient-text">email address</span> for anyone
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Fonatica helps you discover verified business and personal email addresses instantly. 
            Power your outreach with accurate contact data.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90 glow">
                Subscribe Now — $125/mo <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 glass text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-accent" />
            Coming soon: Free email verification tool with 99% accuracy — verify up to 100,000 emails monthly
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Everything you need to <span className="gradient-text">find leads</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools to discover, verify, and manage email contacts at scale.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Business Email Finder', desc: 'Find verified business emails by company domain and employee name.' },
              { icon: Users, title: 'People Search', desc: 'Discover personal and professional emails for any individual.' },
              { icon: Mail, title: 'Email Verification', desc: 'Verify deliverability to keep your bounce rate low.' },
              { icon: Globe, title: 'Domain Search', desc: 'Find all email addresses associated with any company domain.' },
              { icon: Shield, title: 'GDPR Compliant', desc: 'All data sourced and processed in compliance with privacy laws.' },
              { icon: Zap, title: 'API Access', desc: 'Integrate Fonatica into your workflow with our REST API.' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:glow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6" id="pricing">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Simple <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-muted-foreground mb-10">One plan. Unlimited power.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-2xl border border-primary/30 bg-card p-8 glow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk' }}>Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-5xl font-bold gradient-text">$125</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {['Unlimited email lookups', 'Business & personal search', 'Email verification', 'Domain search', 'API access', 'Priority support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full text-base" size="lg">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-5 h-5 invert" />
            <span>Fonatica</span>
          </div>
          <p>© {new Date().getFullYear()} Fonatica. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
