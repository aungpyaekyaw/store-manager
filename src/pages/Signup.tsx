import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const buttonSize = useBreakpointValue({ base: "md", sm: "lg" });
  const padding = useBreakpointValue({ base: 4, sm: 8 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Sign up with shop details in metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            shop_name: shopName,
            shop_description: shopDescription
          }
        }
      });

      if (signUpError) throw signUpError;

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'auth.messages.confirmEmail' }),
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error: unknown) {
      console.error('Signup error:', error);
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: error instanceof Error ? error.message : intl.formatMessage({ id: 'auth.errors.failedSignUp' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 2, sm: 4, md: 6 }}>
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
              {intl.formatMessage({ id: 'auth.signUp' })}
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
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: "sm", sm: "md" }}>
                    {intl.formatMessage({ id: 'shop.name' })}
                  </FormLabel>
                  <Input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    size={buttonSize}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={{ base: "sm", sm: "md" }}>
                    {intl.formatMessage({ id: 'shop.description' })}
                  </FormLabel>
                  <Input
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
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
                  {intl.formatMessage({ id: 'auth.signUp' })}
                </Button>
              </Stack>
            </form>
            <Text fontSize={{ base: "sm", sm: "md" }}>
              {intl.formatMessage({ id: 'auth.alreadyHaveAccount' })}{' '}
              <Link to="/login" style={{ color: 'blue' }}>
                {intl.formatMessage({ id: 'auth.signIn' })}
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
} 