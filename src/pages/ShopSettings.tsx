import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  Card,
  CardBody,
  useBreakpointValue,
  Textarea,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shop } from '../types/database.types';
import Layout from '../components/Layout';

export default function ShopSettings() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const inputSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const labelSize = useBreakpointValue({ base: 'sm', md: 'md' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchShop = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({
          title: intl.formatMessage({ id: 'common.error' }),
          description: intl.formatMessage({ id: 'shop.errors.fetchFailed' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (data) {
        setShop(data);
        setName(data.name);
        setDescription(data.description || '');
      }
    };

    fetchShop();
  }, [user, navigate, toast, intl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
          user_id: user.id
        })
        .eq('id', shop.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'shop.messages.updateSuccess' }),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Update local shop state
      setShop({
        ...shop,
        name,
        description,
        updated_at: new Date().toISOString(),
      });
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'shop.errors.updateFailed' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <Container maxW="container.md" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <Heading size={headingSize}>
            {intl.formatMessage({ id: 'shop.settings.title' })}
          </Heading>
          
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontSize={labelSize}>
                      {intl.formatMessage({ id: 'shop.name' })}
                    </FormLabel>
                    <Input
                      size={inputSize}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={intl.formatMessage({ id: 'shop.namePlaceholder' })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize={labelSize}>
                      {intl.formatMessage({ id: 'shop.description' })}
                    </FormLabel>
                    <Textarea
                      size={inputSize}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={intl.formatMessage({ id: 'shop.descriptionPlaceholder' })}
                      rows={4}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size={inputSize}
                    width="full"
                    isLoading={isLoading}
                  >
                    {intl.formatMessage({ id: 'shop.updateButton' })}
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
} 