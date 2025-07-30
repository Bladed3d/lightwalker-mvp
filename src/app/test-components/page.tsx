'use client';
import React from 'react';
import LightwalkerTimeline3 from '@/components/test/LightwalkerTimeline3';

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Component Testing Area</h1>
        
        <div className="space-y-8">
          {/* Test components will be imported here when ready */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Timeline Components</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center">
              <LightwalkerTimeline3 />
            </div>
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