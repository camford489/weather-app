import 'swiper/css';
import 'swiper/css/navigation';

import {
	Box,
	Button,
	ButtonGroup,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Icon,
	SimpleGrid,
	Stack,
	Text,
	useColorMode,
	useColorModeValue,
	useDisclosure,
	useToast
} from '@chakra-ui/react';
import cardBackground from 'assets/media/backgrounds/mountain.jpg';
import sunnyBackground from 'assets/media/backgrounds/sunny.jpg';
import RemoveCityDrawer from 'components/drawers/RemoveCity';
import Loading from 'components/Loading';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CityResponseType, OneCityCallResponseType } from 'shared/@types/WeatherResponse';
import { getCityCoordinates, getOneCallCityWeather } from 'shared/services/weather/service';
import { SavedCityType } from 'shared/@types/WeatherContext';
import { CurrentWeatherType } from 'shared/@types/WeatherResponse';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BsArrowLeft } from 'react-icons/bs';

import CloudsIcon from 'components/icons/CloudsIcon';
import RainIcon from 'components/icons/Rainicon';
import WindIcon from 'components/icons/WindIcon';
import { AdditionalWeatherType } from 'shared/@types/AdditionalWeather';
import { getWeatherIcon } from 'shared/services/weather/service';
import capitalizeString from 'shared/utils/capitalizeString';
import { getByTimestamp, getTimestampWeekDay } from 'shared/utils/timestampUtils';


import { Link } from 'react-router-dom';

import DailyCard from './partials/cards/Daily';

// type Props = {
// 	city: SavedCityType;
// 	weather: CurrentWeatherType;
// };

const CityWeather = () => {
	// Route Params
	let { country, city } = useParams();

	const toast = useToast();
	const { colorMode } = useColorMode();

	// Remove drawer
	const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

	// States
	const [currentCity, setCurrentCity] = useState<SavedCityType>();
	const [weather, setWeather] = useState<OneCityCallResponseType>();

	// Loading State
	const [isLoading, setIsLoading] = useState(true);

	// Change slides per view with screen size
	const [slidesPerView, setSlidesPerView] = useState<number | 'auto'>(4);

	useEffect(() => {
		// Change slides per view with screen size
		const handleScreenResize = () => {
			if (window.innerWidth < 768) {
				setSlidesPerView(1);
			} else if (window.innerWidth < 1024) {
				setSlidesPerView(3);
			} else {
				setSlidesPerView(5);
			}
		};

		window.addEventListener('resize', handleScreenResize);
		handleScreenResize();

		return () => window.removeEventListener('resize', handleScreenResize);
	}, []);

	// Use Effect to get city info
	useEffect(() => {
		// Filter cities
		const getCityInfo = async () => {
			setIsLoading(true);

			try {
				const cityInfo: CityResponseType = await getCityCoordinates(city!, country!);

				const { name, lat, lon, country: localCountry } = cityInfo[0];

				// Save info on current city
				setCurrentCity({
					name: name,
					country: localCountry,
					coordinates: {
						lat: lat,
						long: lon
					}
				});
			} catch (error) {
				toast({
					description: "Couldn't get weather data! Please try again!",
					status: 'error',
					isClosable: true
				});
			}

			setIsLoading(false);
		};

		getCityInfo();

		return () => setCurrentCity(undefined);
	}, []);

	// Use Effect to get weather data
	useEffect(() => {
		// Get data from API
		const getWeatherData = async () => {

			if (!currentCity) {
				return;
			}

			setIsLoading(true);

			try {
				const data = await getOneCallCityWeather(
					currentCity?.coordinates.lat,
					currentCity?.coordinates.long
				);

				setWeather(data);
			} catch (error) {
				toast({
					description: "Couldn't get weather data! Please try again!"
				});
			}

			setIsLoading(false);
		};

		getWeatherData();

		return () => setWeather(undefined);
	}, [currentCity]);

	return (
		<>
			<Box
				paddingY={6}
				backgroundImage={sunnyBackground}
				backgroundPosition={'center'}
				backgroundSize={'cover'}
				backgroundColor={'blackAlpha.700'}
				backgroundBlendMode={'overlay'}
				as={Flex}
				flexDir={'column'}
				justifyContent={'center'}
				height={'250px'}
			>
				<Container maxW={'container.lg'}>
					{currentCity && weather ? (
						<>
							<Box
								paddingY={6}
								as={Flex}
								flexDir={'column'}
								justifyContent={'left'}
							>
							<Heading as={'h1'} fontWeight={'bold'} fontSize={'4xl'} color={'white'}>
								{currentCity?.name}
							</Heading>
							<Heading as={'h2'} fontWeight={400} fontSize={'2xl'} color={'white'}>
								Current weather conditions
							</Heading>
							<Stack direction='column' spacing={4}>
								<ButtonGroup gap='4'>
									<Button mt={6} onClick={onDrawerOpen}>
										Remove City
									</Button>
									<Button mt={6} spacing={6} as={Link} to={'/'} 
									leftIcon={<Icon as={BsArrowLeft} fontSize={'14px'} />}>
										Back
									</Button>
								</ButtonGroup>
							</Stack>
							</Box>
						</>
					) : (
						<>
							<Heading
								as={'h1'}
								fontWeight={'bold'}
								fontSize={'4xl'}
								color={'white'}
								textTransform={'capitalize'}
							>
								{city}
							</Heading>
							<Heading as={'h2'} fontWeight={400} fontSize={'2xl'} color={'white'}>
								We can&apos;t show the weather for this city!
							</Heading>
						</>
					)}
					
					
					{/* <SimpleGrid spacing={4} columns={[1, 2]}>
						<Box
							
							borderRadius={'10px'}
							color={'white'}
							boxShadow={'lg'}
						>
							<Box
								position={'relative'}
								as={Flex}
								alignItems={'center'}
								justifyContent={'center'}
								flexDir={'column'}
								paddingX={4}
								paddingY={6}
								color={'white'}
								textAlign={'center'}
							>
								<Heading as={'h4'} fontSize={'xs'} fontWeight={'bold'}>
									{getTimestampWeekDay(weather.dt)}
								</Heading>
								<Text>{getByTimestamp(weather.dt)}</Text>

								{weather.weather[0] && (
									<Tooltip
										hasArrow
										label={weather.weather[0].main}
										placement={'top'}
									>
										<Image
											width={'80px'}
											filter={'drop-shadow(0 0 4px white)'}
											src={getWeatherIcon(weather?.weather[0].icon)}
											alt={weather?.weather[0].description}
										/>
									</Tooltip>
								)}

								{weather?.weather[0] && (
									<Text fontSize={'md'}>
										{capitalizeString(weather?.weather[0].description)}
									</Text>
								)}

								<Flex
									justifyContent={'center'}
									flexWrap={'wrap'}
									gap={[0, 0, 2]}
									padding={2}
									w={'100%'}
									marginTop={4}
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
										<Text fontSize={'sm'}>Temperature</Text>
										<Text fontWeight={'bold'}>
											{Math.round(weather.temp)} ºC
										</Text>
									</Box>
									<Box>
										<Text fontSize={'sm'}>Feels Like</Text>
										<Text fontWeight={'bold'}>
											{Math.round(weather.feels_like)} ºC
										</Text>
									</Box>
									<Box>
										<Text fontSize={'sm'}>Humidity</Text>
										<Text fontWeight={'bold'}>
											{Math.round(weather.humidity)}%
										</Text>
									</Box>
								</Flex>
							</Box>
						</Box>

						<Box>
							<Flex gap={2} alignItems={'center'} pt={2}>
								<WindIcon
									fontSize={'4rem'}
									color={useColorModeValue('primary.500', 'secondary.500')}
									fill={useColorModeValue('primary.500', 'secondary.500')}
								/>

								<Box>
									<Text fontSize={'xl'}>Wind</Text>
									<Text fontWeight={300} color={'grey.600'}>
										<strong>Velocity:</strong> {Math.round(weather.wind_speed)}{' '}
										km/h
									</Text>
									<Text fontWeight={300} color={'grey.600'}>
										<strong>Direction:</strong> {Math.round(weather.wind_deg)}º
									</Text>
								</Box>
							</Flex>

							<Flex gap={2} alignItems={'center'} pt={2}>
								<RainIcon
									fontSize={'4rem'}
									color={useColorModeValue('primary.500', 'secondary.500')}
									fill={useColorModeValue('primary.500', 'secondary.500')}
								/>

								<Box>
									<Text fontSize={'xl'}>Rain</Text>
									<Text fontWeight={300} color={'grey.600'}>
										<strong>Percentage:</strong> {weather.rain} %
									</Text>
								</Box>
							</Flex>

							<Flex gap={2} alignItems={'center'} pt={2}>
								<CloudsIcon
									fontSize={'4rem'}
									color={useColorModeValue('primary.500', 'secondary.500')}
									fill={useColorModeValue('primary.500', 'secondary.500')}
								/>

								<Box>
									<Text fontSize={'xl'}>Clouds</Text>
									<Text fontWeight={300} color={'grey.600'}>
										<strong>Percentage:</strong> {weather.clouds} %
									</Text>
								</Box>
							</Flex>
						</Box>
					</SimpleGrid> */}


				</Container>
			</Box>
			<Container maxW={'container.lg'} py={6}>
				<Flex flexDir={'column'} gap={2}>
					{isLoading && <Loading />}

					{!isLoading && currentCity && weather && (
						<>
							<Grid templateColumns={['1fr']} gap={4}>
								{/* <GridItem zIndex={5}>
									<MainWeatherCard
										city={currentCity}
										weather={weather!.current}
									/>
								</GridItem> */}
								<GridItem overflow={'hidden'} maxWidth={'100%'}>
									<Text
										my={2}
										fontSize={'lg'}
										color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
										paddingY={6}
										as={Flex}
										justifyContent={'center'}
									>
										Weather for the next 5 days
									</Text>
									<Swiper
										slidesPerView={slidesPerView}
										spaceBetween={20}
										grabCursor
										navigation
										modules={[Navigation]}
									>
										{weather.daily.slice(1, 6).map((daily) => (
											<SwiperSlide key={daily.dt}>
												<DailyCard weather={daily} />
											</SwiperSlide>
										))}
									</Swiper>

									<Text
										mt={2}
										fontSize={'lg'}
										color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
									>
										<strong>Note:</strong> for further details of a specific
										day, click on the card.
									</Text>
								</GridItem>
							</Grid>
							<RemoveCityDrawer
								isOpen={isDrawerOpen}
								onClose={onDrawerClose}
								city={currentCity}
							/>
						</>
					)}
				</Flex>
			</Container>
		</>
	);
};

export default CityWeather;
