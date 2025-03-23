import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Text,
  Badge,
  Container,
  Heading,
  useToast,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'accept' | 'delivered' | 'cancelled';
  created_at: string;
  items: {
    name: string;
  };
};

const statusColors = {
  pending: 'yellow',
  accept: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const toast = useToast();
  const intl = useIntl();

  const fetchOrders = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (shopError) throw shopError;

      let query = supabase
        .from('orders')
        .select('*, items(name)')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'orders.errors.fetchFailed' }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));

      toast({
        title: intl.formatMessage({ id: 'common.success' }),
        description: intl.formatMessage({ id: 'orders.messages.statusUpdated' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'orders.errors.updateFailed' }),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">
            {intl.formatMessage({ id: 'orders.title' })}
          </Heading>
          <Select
            width="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{intl.formatMessage({ id: 'orders.filter.all' })}</option>
            <option value="pending">{intl.formatMessage({ id: 'orders.filter.pending' })}</option>
            <option value="accept">{intl.formatMessage({ id: 'orders.filter.accept' })}</option>
            <option value="delivered">{intl.formatMessage({ id: 'orders.filter.delivered' })}</option>
            <option value="cancelled">{intl.formatMessage({ id: 'orders.filter.cancelled' })}</option>
          </Select>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : orders.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>{intl.formatMessage({ id: 'orders.noOrders' })}</Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>{intl.formatMessage({ id: 'orders.orderDate' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.customer' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.item' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.quantity' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.totalPrice' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.status' })}</Th>
                  <Th>{intl.formatMessage({ id: 'orders.action' })}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.id}>
                    <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <Text fontWeight="medium">{order.customer_name}</Text>
                      <Text fontSize="sm" color="gray.600">{order.customer_phone}</Text>
                    </Td>
                    <Td>{order.items.name}</Td>
                    <Td>{order.quantity}</Td>
                    <Td>
                      {intl.formatNumber(order.total_price, {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </Td>
                    <Td>
                      <Badge colorScheme={statusColors[order.status]}>
                        {intl.formatMessage({ id: `orders.statuses.${order.status}` })}
                      </Badge>
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        width="150px"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">
                          {intl.formatMessage({ id: 'orders.statuses.pending' })}
                        </option>
                        <option value="accept">
                          {intl.formatMessage({ id: 'orders.statuses.accept' })}
                        </option>
                        <option value="delivered">
                          {intl.formatMessage({ id: 'orders.statuses.delivered' })}
                        </option>
                        <option value="cancelled">
                          {intl.formatMessage({ id: 'orders.statuses.cancelled' })}
                        </option>
                      </Select>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Container>
    </Layout>
  );
} 