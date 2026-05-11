import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — Fonatica';
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); return m;
    })();
    meta.setAttribute('content', 'Articles, guides, and updates from Fonatica on email finding, lead generation, and outreach.');

    supabase.from('blog_posts').select('id,slug,title,excerpt,cover_image_url,published_at')
      .eq('published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-8 h-8 invert" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Fonatica</span>
          </Link>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk' }}>
          The <span className="gradient-text">Fonatica</span> Blog
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
          Insights on lead generation, email outreach, and growing your business with verified contact data.
        </p>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No articles yet — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all">
                {p.cover_image_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 leading-tight">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{p.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}</span>
                    <span className="inline-flex items-center gap-1 group-hover:text-foreground">Read <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
