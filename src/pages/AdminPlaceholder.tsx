
import React from 'react';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const AdminPlaceholder = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center space-y-6 py-8 px-4 text-center">
        <div className="w-24 h-24 bg-canvas-border rounded-full flex items-center justify-center">
          <span className="text-4xl text-canvas-muted">⚙️</span>
        </div>
        
        <h1 className="text-2xl font-medium text-canvas-foreground">Admin Content Management</h1>
        <p className="text-canvas-muted max-w-md">
          This area will allow administrators to manage the Daily Mood Canvas content,
          including quotes, images, and mood associations.
        </p>
        
        <div className="rounded-lg border border-canvas-border bg-white/50 p-6 w-full max-w-sm">
          <h2 className="font-medium mb-4">Coming Soon</h2>
          <ul className="text-left text-canvas-muted space-y-2">
            <li>• Add new quote and image entries</li>
            <li>• Edit existing mood content</li>
            <li>• Review and moderate user submissions</li>
            <li>• Manage featured content</li>
          </ul>
        </div>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 text-canvas-accent hover:underline mt-4"
        >
          <ArrowUp className="w-4 h-4 rotate-90" />
          <span>Return to Canvas</span>
        </Link>
      </div>
    </Layout>
  );
};

export default AdminPlaceholder;
