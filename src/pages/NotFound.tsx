
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { PaintBrush, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <Layout gradientClasses={["from-yellow-50", "via-red-50", "to-yellow-50"]}>
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center space-y-6 py-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-canvas-border opacity-30 rounded-full animate-pulse-slow"></div>
          <div className="absolute inset-2 bg-white/80 rounded-full flex items-center justify-center">
            <PaintBrush className="w-10 h-10 text-canvas-accent" />
          </div>
        </div>

        <h1 className="text-4xl font-display text-canvas-foreground">404</h1>
        <h2 className="text-xl font-medium text-canvas-accent">Canvas Not Found</h2>
        
        <p className="text-canvas-muted max-w-sm">
          We can't seem to find the mood canvas you're looking for.
          Perhaps it was swept away in a creative breeze or is waiting to be painted.
        </p>
        
        <div className="pt-6">
          <Link to="/">
            <Button className="flex items-center gap-2 shadow-warm group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Return to Canvas
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
