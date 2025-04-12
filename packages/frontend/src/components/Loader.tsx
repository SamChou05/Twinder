import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--background-color);
`;

const AppLogo = styled.h1`
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const SpinnerWrapper = styled.div`
  margin: 20px 0;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: ${spin} 1s ease-in-out infinite;
`;

const LoadingText = styled.p`
  color: var(--light-text);
  font-size: 1rem;
`;

const Loader = () => {
  return (
    <LoaderContainer>
      <AppLogo>Twinder</AppLogo>
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
      <LoadingText>Loading...</LoadingText>
    </LoaderContainer>
  );
};

export default Loader; 