import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function Home() {
  return (
    <>
      <Text>Home</Text>
      <Link href='/login'>Voltar para login</Link>
    </>
  );
}
