import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useBreakpointValue,
  Card,
  CardBody,
  HStack,
  useDisclosure,
  Collapse,
  Text,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Category, Shop } from '../types/database.types';
import Layout from '../components/Layout';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();
  const { isOpen, onToggle } = useDisclosure();

  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const inputSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const labelSize = useBreakpointValue({ base: 'sm', md: 'md' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsPageLoading(true);
      // Fetch shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (shopError) {
        toast({
          title: intl.formatMessage({ id: 'common.error' }),
          description: intl.formatMessage({ id: 'shop.errors.fetchFailed' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (shopData) {
        setShop(shopData);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('shop_id', shopData.id);

        if (categoriesError) {
          toast({
            title: intl.formatMessage({ id: 'common.error' }),
            description: intl.formatMessage({ id: 'categories.errors.fetchFailed' }),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        if (categoriesData) {
          setCategories(categoriesData);
        }
      }
      setIsPageLoading(false);
    };

    fetchData();
  }, [user, navigate, toast, intl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop) return;

    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name,
            description,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: intl.formatMessage({ id: 'common.success' }),
          description: intl.formatMessage({ id: 'categories.messages.updateSuccess' }),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name,
              description,
              shop_id: shop.id,
              user_id: user.id
            },
          ]);

        if (error) throw error;

        toast({
          title: intl.formatMessage({ id: 'common.success' }),
          description: intl.formatMessage({ id: 'categories.messages.addSuccess' }),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }

      // Reset form
      setName('');
      setDescription('');
      setEditingId(null);
      if (!editingId) {
        onToggle(); // Hide form after creating
      }

      // Refresh categories
      const { data, error: refreshError } = await supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shop.id);

      if (refreshError) {
        toast({
          title: intl.formatMessage({ id: 'common.error' }),
          description: intl.formatMessage({ id: 'categories.errors.refreshFailed' }),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (data) {
        setCategories(data);
      }
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'categories.errors.saveFailed' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setDescription(category.description);
    setEditingId(category.id);
    if (!isOpen) {
      onToggle(); // Show form when editing
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'categories.messages.deleteSuccess' }),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setCategories(categories.filter((category) => category.id !== id));
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'categories.errors.deleteFailed' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <Container maxW="container.xl" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size={headingSize}>
              {intl.formatMessage({ id: 'categories.title' })}
            </Heading>
            <Button
              colorScheme="blue"
              size={inputSize}
              onClick={() => {
                if (isOpen && editingId) {
                  // Reset form when canceling edit
                  setName('');
                  setDescription('');
                  setEditingId(null);
                }
                onToggle();
              }}
            >
              {isOpen 
                ? intl.formatMessage({ id: 'common.cancel' })
                : intl.formatMessage({ id: 'categories.createButton' })}
            </Button>
          </HStack>

          <Collapse in={isOpen}>
            <Card mb={6}>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'categories.name' })}
                      </FormLabel>
                      <Input
                        size={inputSize}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'categories.namePlaceholder' })}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'categories.description' })}
                      </FormLabel>
                      <Input
                        size={inputSize}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'categories.descriptionPlaceholder' })}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size={inputSize}
                      width="full"
                      isLoading={isLoading}
                    >
                      {intl.formatMessage(
                        editingId
                          ? { id: 'categories.updateButton' }
                          : { id: 'categories.addButton' }
                      )}
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </Collapse>

          <Card>
            <CardBody overflowX="auto">
              {isPageLoading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                </Box>
              ) : categories.length === 0 ? (
                <Text textAlign="center" py={10}>
                  {intl.formatMessage({ id: 'categories.noCategories' })}
                </Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{intl.formatMessage({ id: 'categories.nameColumn' })}</Th>
                      <Th>{intl.formatMessage({ id: 'categories.descriptionColumn' })}</Th>
                      <Th width="120px">{intl.formatMessage({ id: 'common.actions' })}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {categories.map((category) => (
                      <Tr key={category.id}>
                        <Td maxW="200px">
                          <Text noOfLines={1}>{category.name}</Text>
                        </Td>
                        <Td maxW="300px">
                          <Text noOfLines={2}>{category.description}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label={intl.formatMessage({ id: 'categories.editButton' })}
                              icon={<FaEdit />}
                              onClick={() => handleEdit(category)}
                              size={inputSize}
                            />
                            <IconButton
                              aria-label={intl.formatMessage({ id: 'categories.deleteButton' })}
                              icon={<FaTrash />}
                              colorScheme="red"
                              onClick={() => handleDelete(category.id)}
                              size={inputSize}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Layout>
  );
} 