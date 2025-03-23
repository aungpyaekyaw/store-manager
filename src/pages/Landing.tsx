import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { FaStore, FaShoppingCart, FaMobile, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ElementType;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Stack
      align="center"
      textAlign="center"
      p={6}
      rounded="lg"
      bg={useColorModeValue('white', 'gray.800')}
      shadow="lg"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)' }}
    >
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        rounded="full"
        bg={useColorModeValue('blue.100', 'blue.900')}
        color={useColorModeValue('blue.500', 'blue.200')}
        mb={4}
      >
        <Icon as={icon} w={8} h={8} />
      </Flex>
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        {text}
      </Text>
    </Stack>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={{ base: 10, md: 20 }}>
        <VStack spacing={12}>
          {/* Hero Section */}
          <Stack
            align="center"
            spacing={{ base: 8, md: 10 }}
            textAlign="center"
            py={{ base: 10, md: 20 }}
          >
            <Heading
              fontWeight={700}
              fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
              lineHeight="110%"
            >
              {intl.formatMessage({ id: 'landing.hero.title' })}
              <Text as="span" color="blue.500">
                {intl.formatMessage({ id: 'landing.hero.highlight' })}
              </Text>
            </Heading>
            <Text
              color={textColor}
              maxW="2xl"
              fontSize={{ base: 'lg', md: 'xl' }}
            >
              {intl.formatMessage({ id: 'landing.hero.subtitle' })}
            </Text>
            <Stack spacing={6} direction={{ base: 'column', sm: 'row' }}>
              <Button
                size="lg"
                colorScheme="blue"
                px={8}
                onClick={() => navigate(user ? '/shop' : '/signup')}
              >
                {intl.formatMessage(
                  user
                    ? { id: 'landing.cta.dashboard' }
                    : { id: 'landing.cta.getStarted' }
                )}
              </Button>
              {!user && (
                <Button
                  size="lg"
                  px={8}
                  onClick={() => navigate('/login')}
                >
                  {intl.formatMessage({ id: 'landing.cta.login' })}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Features Section */}
          <Box py={10} width="full">
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 4 }}
              spacing={{ base: 8, lg: 12 }}
              px={{ base: 4, sm: 8 }}
            >
              <Feature
                icon={FaStore}
                title={intl.formatMessage({ id: 'landing.features.store.title' })}
                text={intl.formatMessage({ id: 'landing.features.store.description' })}
              />
              <Feature
                icon={FaShoppingCart}
                title={intl.formatMessage({ id: 'landing.features.orders.title' })}
                text={intl.formatMessage({ id: 'landing.features.orders.description' })}
              />
              <Feature
                icon={FaMobile}
                title={intl.formatMessage({ id: 'landing.features.mobile.title' })}
                text={intl.formatMessage({ id: 'landing.features.mobile.description' })}
              />
              <Feature
                icon={FaChartLine}
                title={intl.formatMessage({ id: 'landing.features.analytics.title' })}
                text={intl.formatMessage({ id: 'landing.features.analytics.description' })}
              />
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 