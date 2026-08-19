import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function Login() {
  return (
    <>
      <Text>Login</Text>
      <Link href='/home'>Ir para home</Link>
    </>
  );
}
