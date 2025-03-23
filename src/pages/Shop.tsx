import {
  VStack,
  Heading,
  useToast,
  Text,
  Container,
  useBreakpointValue,
  Card,
  CardBody,
  Skeleton,
  Link,
  Box,
  HStack,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shop as ShopType } from '../types/database.types';
import Layout from '../components/Layout';

export default function Shop() {
  const [shop, setShop] = useState<ShopType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();
  
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchShop = async () => {
      setIsLoading(true);
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
      }
      setIsLoading(false);
    };

    fetchShop();
  }, [user, navigate, toast, intl]);

  if (!user) return null;

  return (
    <Layout>
      <Container maxW="container.md" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size={headingSize}>
              {intl.formatMessage({ id: 'shop.welcome' })}
            </Heading>
            {shop && (
              <Link
                target='_blank'
                as={RouterLink}
                to={`/shops/${shop.id}`}
                color="blue.500"
                fontSize="sm"
                display="flex"
                alignItems="center"
              >
                {intl.formatMessage({ id: 'shop.viewPublicPage' })}
                <Box as={FaExternalLinkAlt} ml={2} />
              </Link>
            )}
          </HStack>
          <Card>
            <CardBody>
              <Skeleton isLoaded={!isLoading}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">
                    {shop?.name || intl.formatMessage({ id: 'shop.loading' })}
                  </Heading>
                  {shop?.description && (
                    <Text color="gray.600">
                      {shop.description}
                    </Text>
                  )}
                </VStack>
              </Skeleton>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
} 