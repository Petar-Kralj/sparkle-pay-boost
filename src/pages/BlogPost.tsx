import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
        if (data) {
          document.title = `${data.title} — Fonatica Blog`;
          const meta = document.querySelector('meta[name="description"]') || (() => {
            const m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); return m;
          })();
          meta.setAttribute('content', data.excerpt || data.title);

          // canonical
          let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
          }
          canonical.href = `${window.location.origin}/blog/${data.slug}`;

          // JSON-LD
          const existing = document.getElementById('blog-jsonld');
          if (existing) existing.remove();
          const ld = document.createElement('script');
          ld.type = 'application/ld+json';
          ld.id = 'blog-jsonld';
          ld.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: data.title,
            description: data.excerpt,
            image: data.cover_image_url,
            datePublished: data.published_at,
            mainEntityOfPage: `${window.location.origin}/blog/${data.slug}`,
            author: { '@type': 'Organization', name: 'Fonatica' },
          });
          document.head.appendChild(ld);
        }
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Fonatica" className="w-8 h-8 invert" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Fonatica</span>
          </Link>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> All articles
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !post ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">Article not found</h1>
            <Link to="/blog" className="text-primary underline">Back to blog</Link>
          </div>
        ) : (
          <>
            {post.published_at && (
              <p className="text-xs text-muted-foreground mb-3">{new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              {post.title}
            </h1>
            {post.excerpt && <p className="text-lg text-muted-foreground mb-8">{post.excerpt}</p>}
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mb-10 border border-border/50" />
            )}
            <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
          </>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
