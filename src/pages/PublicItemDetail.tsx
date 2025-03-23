import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Box,
  Button,
  Container,
  VStack,
  Heading,
  Text,
  useBreakpointValue,
  Card,
  CardBody,
  useToast,
  Skeleton,
  Image,
  Badge,
  Stack,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';
import PublicLayout from '../components/PublicLayout';

// Storage keys
const CUSTOMER_NAME_KEY = 'customerName';
const CUSTOMER_PHONE_KEY = 'customerPhone';

interface OrderFormData {
  name: string;
  phone: string;
  quantity: number;
}

export default function PublicItemDetail() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { shopId, itemId } = useParams();
  const toast = useToast();
  
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    name: localStorage.getItem(CUSTOMER_NAME_KEY) || '',
    phone: localStorage.getItem(CUSTOMER_PHONE_KEY) || '',
    quantity: 1
  });

  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const imageSize = useBreakpointValue({ base: "300px", md: "400px" });

  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  const fetchItem = async (): Promise<void> => {
    if (!itemId) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*, shops(*), categories(*)')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      if (data) setItem(data);
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'publicItem.errors.fetchFailed' }),
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const handleBack = () => {
    if (shopId) {
      navigate(`/shops/${shopId}`);
    }
  };

  const validateForm = (): boolean => {
    if (!orderForm.name || !orderForm.phone || orderForm.quantity < 1) {
      toast({
        title: intl.formatMessage({ id: 'publicItem.orderForm.errors.invalidForm' }),
        status: 'error'
      });
      return false;
    }
    return true;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !shopId || !itemId) return;

    setIsSubmitting(true);
    try {
      // Store customer details in localStorage
      localStorage.setItem(CUSTOMER_NAME_KEY, orderForm.name);
      localStorage.setItem(CUSTOMER_PHONE_KEY, orderForm.phone);

      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            shop_id: shopId,
            item_id: itemId,
            customer_name: orderForm.name,
            customer_phone: orderForm.phone,
            quantity: orderForm.quantity,
            total_price: item?.price ? item.price * orderForm.quantity : 0,
            status: 'pending'
          }
        ]);

      if (orderError) throw orderError;

      // Update item stock
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          count: item!.count - orderForm.quantity 
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      toast({
        title: intl.formatMessage({ id: 'publicItem.orderForm.success' }),
        status: 'success'
      });

      closeModal();
      fetchItem(); // Refresh item data to show updated stock
    } catch (_err) {
      toast({
        title: intl.formatMessage({ id: 'publicItem.orderForm.errors.orderFailed' }),
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (_: string, valueAsNumber: number) => {
    setOrderForm(prev => ({
      ...prev,
      quantity: valueAsNumber
    }));
  };

  return (
    <PublicLayout>
      <Container maxW="container.xl" py={containerPadding}>
        <VStack spacing={6} align="stretch">
          <Stack direction="row" align="center" spacing={4}>
            <IconButton
              aria-label="Back to shop"
              icon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="ghost"
            />
            <Heading size={headingSize}>
              {item?.shops?.name || intl.formatMessage({ id: 'common.loading' })}
            </Heading>
          </Stack>

          <Card>
            <CardBody>
              <Skeleton isLoaded={!isLoading}>
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  spacing={8}
                  align="start"
                >
                  <Box flexShrink={0}>
                    <Image
                      src={item?.image_url || '/placeholder.png'}
                      alt={item?.name}
                      width={imageSize}
                      height={imageSize}
                      objectFit="cover"
                      borderRadius="lg"
                    />
                  </Box>

                  <VStack align="stretch" spacing={4} flex="1">
                    <Stack direction="row" justify="space-between" align="center">
                      <Heading size="lg">{item?.name}</Heading>
                      <Badge 
                        colorScheme={item?.count > 0 ? 'green' : 'red'}
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {item?.count > 0
                          ? intl.formatMessage(
                              { id: 'publicItem.stockStatus.inStock' },
                              { count: item.count }
                            )
                          : intl.formatMessage({ id: 'publicItem.stockStatus.outOfStock' })}
                      </Badge>
                    </Stack>

                    {item?.categories && (
                      <Badge colorScheme="blue" alignSelf="start">
                        {item.categories.name}
                      </Badge>
                    )}

                    <Text color="blue.600" fontSize="3xl" fontWeight="bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(item?.price || 0)}
                    </Text>

                    <Divider />

                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="semibold">
                        {intl.formatMessage({ id: 'publicItem.description' })}
                      </Text>
                      <Text color="gray.600">
                        {item?.description || intl.formatMessage({ id: 'publicItem.noDescription' })}
                      </Text>
                    </VStack>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      isDisabled={!item?.count || item.count <= 0}
                      onClick={openModal}
                      mt={4}
                    >
                      {intl.formatMessage({ id: 'publicItem.orderForm.submit' })}
                    </Button>
                  </VStack>
                </Stack>
              </Skeleton>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {intl.formatMessage({ id: 'publicItem.orderForm.title' })}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleOrderSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>
                    {intl.formatMessage({ id: 'publicItem.orderForm.customerName' })}
                  </FormLabel>
                  <Input
                    name="name"
                    value={orderForm.name}
                    onChange={handleInputChange}
                    placeholder={intl.formatMessage({ 
                      id: 'publicItem.orderForm.namePlaceholder' 
                    })}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    {intl.formatMessage({ id: 'publicItem.orderForm.customerPhone' })}
                  </FormLabel>
                  <Input
                    name="phone"
                    value={orderForm.phone}
                    onChange={handleInputChange}
                    placeholder={intl.formatMessage({ 
                      id: 'publicItem.orderForm.phonePlaceholder' 
                    })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>
                    {intl.formatMessage({ id: 'publicItem.orderForm.quantity' })}
                  </FormLabel>
                  <NumberInput
                    min={1}
                    max={item?.count || 1}
                    value={orderForm.quantity}
                    onChange={handleQuantityChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Text fontWeight="bold">
                  {intl.formatMessage(
                    { id: 'publicItem.orderForm.totalPrice' },
                    { price: new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(item?.price * orderForm.quantity || 0) }
                  )}
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeModal}>
                {intl.formatMessage({ id: 'publicItem.orderForm.cancel' })}
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
              >
                {intl.formatMessage({ id: 'publicItem.orderForm.submit' })}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </PublicLayout>
  );
} 