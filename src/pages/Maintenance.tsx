import { AlertTriangle } from 'lucide-react';
import logo from '@/assets/logo.png';

const Maintenance = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="text-center max-w-md">
      <img src={logo} alt="Fonatica" className="w-12 h-12 invert mx-auto mb-6" />
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
        We'll Be Back Soon
      </h1>
      <p className="text-muted-foreground leading-relaxed">
        Our website is currently experiencing technical difficulties. We're working hard to fix things and will have everything updated soon. Thank you for your patience!
      </p>
    </div>
  </div>
);

export default Maintenance;
