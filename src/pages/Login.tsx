import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const buttonSize = useBreakpointValue({ base: "md", sm: "lg" });
  const padding = useBreakpointValue({ base: 4, sm: 8 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/shop');
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: error instanceof Error ? error.message : intl.formatMessage({ id: 'auth.errors.failedSignIn' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 2, sm: 4, md: 6 }} w="100%">
      <Box
        mx="auto"
        w="100%"
        maxW={{ base: "100%", md: "container.sm" }}
        px={{ base: 2, sm: 4, md: 6 }}
      >
        <Box
          w="100%"
          borderRadius={{ base: 0, sm: "lg" }}
          bg="white"
          boxShadow="sm"
          p={padding}
        >
          <VStack spacing={6} w="100%">
            <Heading size={{ base: "lg", sm: "xl" }}>
              {intl.formatMessage({ id: 'auth.signIn' })}
            </Heading>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", sm: "md" }}>
                    {intl.formatMessage({ id: 'auth.email' })}
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size={buttonSize}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", sm: "md" }}>
                    {intl.formatMessage({ id: 'auth.password' })}
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size={buttonSize}
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size={buttonSize}
                  fontSize={{ base: "sm", sm: "md" }}
                  isLoading={isLoading}
                  w="100%"
                >
                  {intl.formatMessage({ id: 'auth.signIn' })}
                </Button>
              </Stack>
            </form>
            <Text fontSize={{ base: "sm", sm: "md" }}>
              {intl.formatMessage({ id: 'auth.dontHaveAccount' })}{' '}
              <Link to="/signup" style={{ color: 'blue' }}>
                {intl.formatMessage({ id: 'auth.signUp' })}
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
} 