import { notFound } from 'next/navigation';

// Catch all unknown routes inside a locale and trigger the localized 404
export default function CatchAll() {
  notFound();
}