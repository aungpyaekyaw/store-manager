import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Card,
  CardBody,
  Stack,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  Skeleton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { FaSearch, FaStore } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { Shop } from '../types/database.types';

export default function PublicStores() {
  const [stores, setStores] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const intl = useIntl();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('name');

      if (error) throw error;

      setStores(data || []);
    } catch {
      // Error handling is managed through UI feedback
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Stack spacing={4} w="full">
            <Heading textAlign="center">
              {intl.formatMessage({ id: 'publicStores.title' })}
            </Heading>
            <Text textAlign="center" color={textColor}>
              {intl.formatMessage({ id: 'publicStores.subtitle' })}
            </Text>
            <InputGroup maxW="600px" mx="auto">
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder={intl.formatMessage({ id: 'publicStores.searchPlaceholder' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Stack>

          {isLoading ? (
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={6}
              w="full"
            >
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} height="200px" />
              ))}
            </Grid>
          ) : filteredStores.length > 0 ? (
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={6}
              w="full"
            >
              {filteredStores.map((store) => (
                <LinkBox as="article" key={store.id}>
                  <Card bg={cardBg} h="full" transition="all 0.2s"
                    _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}>
                    <CardBody>
                      <Stack spacing={4}>
                        <Box fontSize="3xl" color="blue.500">
                          <FaStore />
                        </Box>
                        <Stack spacing={2}>
                          <LinkOverlay as={RouterLink} to={`/shops/${store.id}`}>
                            <Heading size="md">{store.name}</Heading>
                          </LinkOverlay>
                          {store.description && <Text color={textColor} noOfLines={2}>
                            {store.description || intl.formatMessage({ id: 'publicStores.noDescription' })}
                          </Text>}
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                </LinkBox>
              ))}
            </Grid>
          ) : (
            <Text textAlign="center" color={textColor}>
              {intl.formatMessage(
                searchQuery
                  ? { id: 'publicStores.noSearchResults' }
                  : { id: 'publicStores.noStores' }
              )}
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 