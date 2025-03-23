import {
  Box,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const containerPadding = useBreakpointValue({ base: 2, sm: 4, md: 6 });

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Box w="100%" py={{ base: 2, sm: 4, md: 6 }}>
        <Box
          mx="auto"
          w="100%"
          maxW={{ base: "100%", md: "container.xl" }}
          px={containerPadding}
        >
          <Box
            w="100%"
            borderRadius={{ base: 0, sm: "lg" }}
            bg="white"
            boxShadow="sm"
            p={containerPadding}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 