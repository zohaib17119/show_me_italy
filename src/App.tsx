import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AuthBridgeInit } from '@/features/auth/AuthBridgeInit';

export default function App() {
  return (
    <>
      <AuthBridgeInit />
      <RouterProvider router={router} />
    </>
  );
}
