import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.500',
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
  },
});

export default theme; 