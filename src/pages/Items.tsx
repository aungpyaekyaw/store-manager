import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  Container,
  Select,
  NumberInput,
  NumberInputField,
  Card,
  CardBody,
  useBreakpointValue,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  useDisclosure,
  Collapse,
  Image,
  Box,
  AspectRatio,
  Spinner,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaEyeSlash, FaEye } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Item, Category, Shop } from '../types/database.types';
import Layout from '../components/Layout';
import { uploadItemImage, deleteItemImage } from '../utils/imageUpload';

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [count, setCount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();
  const { isOpen, onToggle } = useDisclosure();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const inputSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const labelSize = useBreakpointValue({ base: 'sm', md: 'md' });

  const fetchItems = async () => {
    if (!shop?.id) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('shop_id', shop.id);

      if (fetchError) throw fetchError;
      if (data) setItems(data);
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'items.errors.fetchFailed' }),
        status: 'error',
      });
    }
  };

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

         // Fetch items
         await fetchItems();

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: intl.formatMessage({ id: 'items.errors.invalidImageType' }),
        status: 'error',
      });
      return;
    }

    // Validate file size (800KB)
    const maxSize = 800 * 1024; // 800KB in bytes
    if (file.size > maxSize) {
      toast({
        title: intl.formatMessage({ id: 'items.errors.imageTooLarge' }),
        status: 'error',
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price.toString());
    setCount(item.count.toString());
    setCategoryId(item.category_id || '');
    setImagePreview(item.image_url || '');
    if (!isOpen) {
      onToggle();
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'items.messages.deleteSuccess' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh items list
      fetchItems();
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'items.errors.deleteFailed' }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleVisibility = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_disabled: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage(
          !currentStatus 
            ? { id: 'items.messages.disableSuccess' }
            : { id: 'items.messages.enableSuccess' }
        ),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh items list
      fetchItems();
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'items.errors.updateFailed' }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;
    
    setIsLoading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadItemImage(imageFile, shop.id);
        toast({
          title: intl.formatMessage({ id: 'items.messages.imageUploadSuccess' }),
          status: 'success',
        });
      }

      if (editingId) {
        // Update existing item
        const updateData: Partial<Item> = {
          name,
          description,
          price: parseFloat(price),
          count: parseInt(count),
          category_id: categoryId,
        };

        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error: updateError } = await supabase
          .from('items')
          .update(updateData)
          .eq('id', editingId);

        if (updateError) throw updateError;

        toast({
          title: intl.formatMessage({ id: 'common.success' }),
          description: intl.formatMessage({ id: 'items.messages.updateSuccess' }),
          status: 'success',
        });
      } else {
        // Create new item
        const { error: createError } = await supabase
          .from('items')
          .insert([
            {
              name,
              description,
              price: parseFloat(price),
              count: parseInt(count),
              category_id: categoryId,
              shop_id: shop.id,
              image_url: imageUrl,
              user_id: user?.id,
            },
          ]);

        if (createError) throw createError;

        toast({
          title: intl.formatMessage({ id: 'common.success' }),
          description: intl.formatMessage({ id: 'items.messages.addSuccess' }),
          status: 'success',
        });
      }

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCount('');
      setCategoryId('');
      setImageFile(null);
      setImagePreview('');
      setEditingId(null);
      if (!editingId) {
        onToggle(); // Close form only for new items
      }
      
      // Refresh items list
      fetchItems();
    } catch (_err) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage(
          editingId 
            ? { id: 'items.errors.updateFailed' }
            : { id: 'items.errors.addFailed' }
        ),
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <Container maxW="container.xl" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size={headingSize}>
              {intl.formatMessage({ id: 'items.title' })}
            </Heading>
            <Button
              colorScheme="blue"
              size={inputSize}
              onClick={() => {
                if (isOpen && editingId) {
                  // Reset form when canceling edit
                  setName('');
                  setDescription('');
                  setPrice('');
                  setCount('');
                  setCategoryId('');
                  setImageFile(null);
                  setImagePreview('');
                  setEditingId(null);
                }
                onToggle();
              }}
            >
              {isOpen 
                ? intl.formatMessage({ id: 'common.cancel' })
                : intl.formatMessage({ id: 'items.createButton' })}
            </Button>
          </HStack>
          
          <Collapse in={isOpen}>
            <Card mb={6}>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.name' })}
                      </FormLabel>
                      <Input
                        size={inputSize}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'items.namePlaceholder' })}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.description' })}
                      </FormLabel>
                      <Textarea
                        size={inputSize}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'items.descriptionPlaceholder' })}
                        rows={3}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.price' })}
                      </FormLabel>
                      <NumberInput 
                        min={0} 
                        size={inputSize}
                        value={price}
                        onChange={(_, value) => setPrice(value.toString())}
                      >
                        <NumberInputField
                          placeholder={intl.formatMessage({ id: 'items.pricePlaceholder' })}
                        />
                      </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.count' })}
                      </FormLabel>
                      <NumberInput 
                        min={0} 
                        size={inputSize}
                        value={count}
                        onChange={(_, value) => setCount(value.toString())}
                      >
                        <NumberInputField
                          placeholder={intl.formatMessage({ id: 'items.countPlaceholder' })}
                        />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.image' })}
                      </FormLabel>
                      <Box
                        borderWidth={2}
                        borderStyle="dashed"
                        borderRadius="md"
                        p={4}
                        textAlign="center"
                        cursor="pointer"
                        onClick={() => document.getElementById('image-input')?.click()}
                      >
                        {imagePreview ? (
                          <AspectRatio ratio={16/9} maxW="400px" mx="auto">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              objectFit="contain"
                            />
                          </AspectRatio>
                        ) : (
                          <>
                            <Text>{intl.formatMessage({ id: 'items.imageUpload.dragDrop' })}</Text>
                            <Text fontSize="sm" color="gray.500" mt={2}>
                              {intl.formatMessage({ id: 'items.imageUpload.maxSize' })}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {intl.formatMessage({ id: 'items.imageUpload.allowedTypes' })}
                            </Text>
                          </>
                        )}
                      </Box>
                      <Input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize={labelSize}>
                        {intl.formatMessage({ id: 'items.category' })}
                      </FormLabel>
                      <Select
                        size={inputSize}
                        placeholder={intl.formatMessage({ id: 'items.categoryPlaceholder' })}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
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
                          ? { id: 'items.updateButton' }
                          : { id: 'items.addButton' }
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
              ) : items.length === 0 ? (
                <Text textAlign="center" py={10}>
                  {intl.formatMessage({ id: 'items.noItems' })}
                </Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{intl.formatMessage({ id: 'items.image' })}</Th>
                      <Th>{intl.formatMessage({ id: 'items.name' })}</Th>
                      <Th>{intl.formatMessage({ id: 'items.description' })}</Th>
                      <Th isNumeric>{intl.formatMessage({ id: 'items.price' })}</Th>
                      <Th isNumeric>{intl.formatMessage({ id: 'items.count' })}</Th>
                      <Th>{intl.formatMessage({ id: 'items.category' })}</Th>
                      <Th width="100px">{intl.formatMessage({ id: 'common.actions' })}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          {item.image_url ? (
                            <AspectRatio ratio={1} w="50px">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                objectFit="cover"
                                borderRadius="md"
                                opacity={item.is_disabled ? 0.5 : 1}
                              />
                            </AspectRatio>
                          ) : (
                            <Box w="50px" h="50px" bg="gray.100" borderRadius="md" />
                          )}
                        </Td>
                        <Td>{item.name}</Td>
                        <Td>
                          <Text noOfLines={2}>{item.description}</Text>
                        </Td>
                        <Td isNumeric>
                          {intl.formatNumber(item.price, {
                            style: 'currency',
                            currency: 'USD'
                          })}
                        </Td>
                        <Td isNumeric>{item.count}</Td>
                        <Td>
                          {categories.find(c => c.id === item.category_id)?.name || '-'}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label={intl.formatMessage({ id: 'common.edit' })}
                              icon={<FaEdit />}
                              size="sm"
                              onClick={() => handleEdit(item)}
                            />
                            <IconButton
                              aria-label={intl.formatMessage({ id: 'common.delete' })}
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(item.id)}
                            />
                            <Tooltip
                              label={intl.formatMessage(
                                item.is_disabled
                                  ? { id: 'items.enable' }
                                  : { id: 'items.disable' }
                              )}
                            >
                              <IconButton
                                aria-label={intl.formatMessage(
                                  item.is_disabled
                                    ? { id: 'items.enable' }
                                    : { id: 'items.disable' }
                                )}
                                icon={item.is_disabled ? <FaEye /> : <FaEyeSlash />}
                                size="sm"
                                colorScheme={item.is_disabled ? "green" : "gray"}
                                onClick={() => handleToggleVisibility(item.id, item.is_disabled)}
                              />
                            </Tooltip>
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