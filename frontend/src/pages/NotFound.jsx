import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-max mx-auto text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">404 error</p>
        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Page not found.
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or the link might be broken.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            <Home className="mr-2 h-5 w-5" />
            Go back home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
