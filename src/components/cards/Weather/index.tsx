import {
	Box,
	Flex,
	Heading,
	Icon,
	IconButton,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	Tooltip,
	useColorMode,
	useDisclosure,
	useToast
} from '@chakra-ui/react';
import cardBackground from 'assets/media/backgrounds/mountain.jpg';
import RemoveCityDrawer from 'components/drawers/RemoveCity';
import { useEffect, useState } from 'react';
import { IoEllipsisVertical } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { SavedCityType } from 'shared/@types/WeatherContext';
import { CurrentWeatherType } from 'shared/@types/WeatherResponse';
import { getOneCallCityWeather, getWeatherIcon } from 'shared/services/weather/service';
import capitalizeString from 'shared/utils/capitalizeString';

type Props = {
	city: SavedCityType;
};

const WeatherCard = ({ city, ...props }: Props) => {
	const { colorMode } = useColorMode();
	const toast = useToast();

	const [weather, setWeather] = useState<CurrentWeatherType>();

	// Remove drawer
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		// API Request
		const getWeatherData = async () => {
			try {
				const data = await getOneCallCityWeather(
					city.coordinates.lat,
					city.coordinates.long
				);

				setWeather(data.current);
			} catch (error) {
				toast({
					description: "Couldn't get weather data. Please try again later.",
					status: 'error',
					isClosable: true
				});
			}
		};

		getWeatherData();
	}, []);

	return (
		<>
			{weather && (
				<Box
					{...props}
					backgroundImage={`${cardBackground}`}
					backgroundPosition={'center'}
					backgroundRepeat={'no-repeat'}
					backgroundSize={'cover'}
					backgroundColor={'blackAlpha.600'}
					backgroundBlendMode={'overlay'}
					transition={'all 0.3s ease-in-out'}
					_hover={{
						backgroundColor: 'blackAlpha.700'
					}}
					borderRadius={'20px'}
					color={'white'}
					boxShadow={'lg'}
					as={Link}
					to={`/${city.country.toLowerCase()}/${city.name.toLowerCase()}`}
				>
					<Box
						position={'relative'}
						as={Flex}
						alignItems={'center'}
						justifyContent={'space-between'}
						flexDir={'row'}
						paddingX={4}
						paddingY={2}
						color={'white'}
						textAlign={'center'}
					>
						<RemoveCityDrawer city={city} isOpen={isOpen} onClose={onClose} />
						<Box
						position={'relative'}
						as={Flex}
						alignItems={'center'}
						justifyContent={'space-between'}
						flexDir={'row'}
						paddingX={4}
						paddingY={6}
						color={'white'}
						textAlign={'center'}
					>
						{weather.weather[0] && (
							<Tooltip hasArrow label={weather.weather[0].main} placement={'left'}>
								<Image
									width={'80px'}
									filter={'drop-shadow(0 0 4px white)'}
									src={getWeatherIcon(weather?.weather[0].icon)}
									alt={weather?.weather[0].description}
								/>
							</Tooltip>
						)}
						<Box
						position={'relative'}
						as={Flex}
						alignItems={'center'}
						justifyContent={'center'}
						flexDir={'column'}
						textAlign={'center'}
						>
						<Heading fontSize={'2xl'}>
							{city.name} {''}
							<Text
								as={'sup'}
								fontSize={'xs'}
								fontWeight={'bold'}
								backgroundColor={'secondary.500'}
								color={'white'}
								px={2}
								borderRadius={10}
							>
								{city.country}
							</Text>
						</Heading>
						</Box>
						</Box>
						{weather?.weather[0] && (
							<Text fontSize={'3xl'}>
								{capitalizeString(weather?.weather[0].description)}
							</Text>
						)}

						<Flex
							justifyContent={'center'}
							flexWrap={'wrap'}
							gap={[0, 0, 2]}
							padding={2}
							w={'30%'}
							// marginTop={4}
							borderRadius={'10px'}
							backgroundColor={'whiteAlpha.500'}
							sx={{
								'& *': {
									textAlign: 'center',
									flex: ['0 1 50%', '0 1 50%', 'auto']
								}
							}}
						>
							<Box>
								<Text fontSize={'sm'}>Current Temp.</Text>
								<Text fontWeight={'bold'}>{Math.round(weather.temp)} ºC</Text>
							</Box>
							<Box>
								<Text fontSize={'sm'}>Feels Like</Text>
								<Text fontWeight={'bold'}>
									{Math.round(weather?.feels_like)} ºC
								</Text>
							</Box>
							<Box>
								<Text fontSize={'sm'}>Humidity</Text>
								<Text fontWeight={'bold'}>{Math.round(weather.humidity)}%</Text>
							</Box>
						</Flex>
					</Box>
				</Box>
			)}
		</>
	);
};

export default WeatherCard;
