import type { Route } from './+types/reset-password';
import { ResetPasswordPage } from '~/components/ResetPasswordPage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Reset Password - Smart Academic Calendar' },
    { name: 'description', content: 'Reset your account password' },
  ];
}

export default function ResetPassword() {
  return <ResetPasswordPage />;
}
