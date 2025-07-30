'use client';
import React from 'react';
import LightwalkerTimeline0 from '@/components/test/lightwalker-timeline-0';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Component Testing Area</h1>
        
        <div className="space-y-8">
          {/* Timeline Component 0 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Timeline Version 0</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <LightwalkerTimeline0 />
            </div>
          </div>

          {/* Other timeline components temporarily disabled for build */}
          <div className="bg-gray-100 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-500">Other Timeline Versions</h2>
            <p className="text-gray-600">Timeline components 1 and 3 temporarily disabled for TypeScript build.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}