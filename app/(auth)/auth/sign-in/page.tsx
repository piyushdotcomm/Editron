import { EditronAuthPage } from '@/components/ui/editron-auth-page';
import { signIn } from '@/auth';

async function handleGoogleSignIn() {
  'use server';
  await signIn('google');
}

async function handleGithubSignIn() {
  'use server';
  await signIn('github');
}

const Page = () => {
  return (
    <EditronAuthPage
      onGoogleSignIn={handleGoogleSignIn}
      onGithubSignIn={handleGithubSignIn}
    />
  );
};

export default Page;