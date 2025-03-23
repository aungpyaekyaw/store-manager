import {
  Box,
  Flex,
  Button,
  IconButton,
  Heading,
  Stack,
  useToast,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (_error) {
      toast({
        title: intl.formatMessage({ id: 'common.error' }),
        description: intl.formatMessage({ id: 'auth.errors.failedSignOut' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const NavLinks = () => (
    <Stack direction={isMobile ? 'column' : 'row'} spacing={4}>
      <Button
        as={Link}
        to="/shop"
        variant={location.pathname === '/shop' ? 'solid' : 'ghost'}
        w={isMobile ? 'full' : 'auto'}
      >
        {intl.formatMessage({ id: 'shop.profile' })}
      </Button>
      <Button
        as={Link}
        to="/items"
        variant={location.pathname === '/items' ? 'solid' : 'ghost'}
        w={isMobile ? 'full' : 'auto'}
      >
        {intl.formatMessage({ id: 'items.title' })}
      </Button>
      <Button
        as={Link}
        to="/orders"
        variant={location.pathname === '/orders' ? 'solid' : 'ghost'}
        w={isMobile ? 'full' : 'auto'}
      >
        {intl.formatMessage({ id: 'orders.title' })}
      </Button>
      <Button
        as={Link}
        to="/categories"
        variant={location.pathname === '/categories' ? 'solid' : 'ghost'}
        w={isMobile ? 'full' : 'auto'}
      >
        {intl.formatMessage({ id: 'categories.title' })}
      </Button>
      <Button
        as={Link}
        to="/shop/settings"
        variant={location.pathname === '/shop/settings' ? 'solid' : 'ghost'}
        w={isMobile ? 'full' : 'auto'}
        leftIcon={<SettingsIcon />}
      >
        {intl.formatMessage({ id: 'shop.settings.title' })}
      </Button>
      <Button
        onClick={handleSignOut}
        colorScheme="red"
        variant="outline"
        w={isMobile ? 'full' : 'auto'}
      >
        {intl.formatMessage({ id: 'auth.signOut' })}
      </Button>
    </Stack>
  );

  if (!user) return null;

  return (
    <Box bg="white" px={4} py={2} boxShadow="sm">
      <Flex alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto">
        <Heading size="md">
          {intl.formatMessage({ id: 'app.title' })}
        </Heading>

        {isMobile ? (
          <>
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
            />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                  {intl.formatMessage({ id: 'app.title' })}
                </DrawerHeader>
                <DrawerBody>
                  <NavLinks />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <NavLinks />
        )}
      </Flex>
    </Box>
  );
} 