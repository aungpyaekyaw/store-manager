import {
  Container,
  VStack,
  Heading,
  Text,
  useBreakpointValue,
  Card,
  CardBody,
  useToast,
  Skeleton,
  SimpleGrid,
  Image,
  Button,
  Badge,
  Stack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { supabase } from '../lib/supabase';
import { Item, Shop, Category } from '../types/database.types';
import PublicLayout from '../components/PublicLayout';

export default function PublicShop() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (shopError) throw shopError;
        setShop(shopData);

        // Fetch categories for this shop
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('shop_id', shopId);

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch items for this shop
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('shop_id', shopId);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

      } catch (_error) {
        toast({
          title: intl.formatMessage({ id: 'common.error' }),
          description: intl.formatMessage({ id: 'shop.errors.fetchFailed' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId, toast, intl]);

  const handleViewDetails = (itemId: string) => {
    navigate(`/shops/${shopId}/items/${itemId}`);
  };

  if (!shopId) return null;

  return (
    <PublicLayout>
      <Container maxW="container.xl" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <Skeleton isLoaded={!isLoading}>
            <VStack align="stretch" spacing={2}>
              <Heading size={headingSize}>
                {shop?.name || intl.formatMessage({ id: 'shop.loading' })}
              </Heading>
              {shop?.description && (
                <Text color="gray.600">
                  {shop.description}
                </Text>
              )}
            </VStack>
          </Skeleton>

          <SimpleGrid columns={columns} spacing={6}>
            {items.map((item) => (
              <Card key={item.id} overflow="hidden">
                <Image
                  src={item.image_url || 'https://via.placeholder.com/300x200'}
                  alt={item.name}
                  height="200px"
                  objectFit="cover"
                />
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Stack direction="row" justify="space-between" align="center">
                      <Heading size="md" noOfLines={1}>
                        {item.name}
                      </Heading>
                      <Badge 
                        colorScheme={item.count > 0 ? 'green' : 'red'}
                        variant="subtle"
                      >
                        {item.count > 0 
                          ? intl.formatMessage({ id: 'items.inStock' }, { count: item.count })
                          : intl.formatMessage({ id: 'items.outOfStock' })
                        }
                      </Badge>
                    </Stack>
                    
                    <Text color="gray.600" noOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <Badge colorScheme="blue" alignSelf="start">
                      {categories.find(c => c.id === item.category_id)?.name || '-'}
                    </Badge>
                    
                    <Stack direction="row" justify="space-between" align="center">
                      <Text color="blue.600" fontSize="2xl" fontWeight="bold">
                        {intl.formatNumber(item.price, {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </Text>
                      <Button
                        colorScheme="blue"
                        onClick={() => handleViewDetails(item.id)}
                      >
                        {intl.formatMessage({ id: 'items.viewDetails' })}
                      </Button>
                    </Stack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {items.length === 0 && !isLoading && (
            <Card>
              <CardBody>
                <Text color="gray.500" textAlign="center">
                  {intl.formatMessage({ id: 'items.noItems' })}
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </PublicLayout>
  );
} 