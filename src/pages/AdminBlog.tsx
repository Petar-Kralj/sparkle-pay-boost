import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2, Upload, Eye } from 'lucide-react';
import logo from '@/assets/logo.png';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
}

const empty: Post = { id: '', slug: '', title: '', excerpt: '', content: '', cover_image_url: '', published: false, published_at: null };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

const AdminBlog = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user, authLoading, navigate]);

  const load = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts((data || []) as Post[]);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const onUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploading(false); return; }
    const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
    setEditing((p) => p ? { ...p, cover_image_url: data.publicUrl } : p);
    setUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim()) {
      toast({ title: 'Title and slug are required', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug,
      title: editing.title,
      excerpt: editing.excerpt || null,
      content: editing.content,
      cover_image_url: editing.cover_image_url || null,
      published: editing.published,
      published_at: editing.published ? (editing.published_at || new Date().toISOString()) : null,
      author_id: user!.id,
    };
    const { error } = editing.id
      ? await supabase.from('blog_posts').update(payload).eq('id', editing.id)
      : await supabase.from('blog_posts').insert(payload);
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else load();
  };

  if (authLoading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Admin access required.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-8 h-8 invert" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Fonatica</span>
          </Link>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">View blog</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {!editing ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Manage Articles</h1>
              <Button onClick={() => setEditing({ ...empty })}><Plus className="w-4 h-4" /> New article</Button>
            </div>
            <div className="space-y-3">
              {posts.length === 0 && <p className="text-muted-foreground">No articles yet.</p>}
              {posts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
                  {p.cover_image_url && <img src={p.cover_image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{p.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
                  </div>
                  {p.published && (
                    <Link to={`/blog/${p.slug}`} target="_blank"><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></Link>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk' }}>{editing.id ? 'Edit article' : 'New article'}</h1>
            <div className="space-y-5">
              <div>
                <Label>Title</Label>
                <Input value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  placeholder="How to find any business email" />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="how-to-find-any-business-email" />
                <p className="text-xs text-muted-foreground mt-1">/blog/{editing.slug || '...'}</p>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="One or two sentence summary used in listings and SEO" rows={2} />
              </div>
              <div>
                <Label>Cover image</Label>
                <div className="flex items-center gap-3">
                  <input id="cover" type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                  <label htmlFor="cover">
                    <Button asChild variant="outline" disabled={uploading}><span><Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload image'}</span></Button>
                  </label>
                  {editing.cover_image_url && <img src={editing.cover_image_url} alt="" className="h-16 rounded-lg border border-border/50" />}
                </div>
              </div>
              <div>
                <Label>Content (Markdown)</Label>
                <Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder={`# Heading\n\nWrite your article in Markdown. Supports **bold**, *italic*, [links](https://example.com), lists, code, images, tables, and more.`}
                  rows={20} className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-1">Markdown is rendered with GitHub-flavored extensions.</p>
              </div>
              <div className="flex items-center gap-2">
                <input id="pub" type="checkbox" checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="pub" className="cursor-pointer">Published (visible to everyone)</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save article'}</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
