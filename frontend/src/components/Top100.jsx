import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./Top100.scss";

function Top100() {
    const [favorites, setFavorites] = useState([]);
    const [top100Data, setTop100Data] = useState([]);
    const navigate = useNavigate();
    const [dots, setDots] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const addToFavorites = async (id) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('Token is missing');
                return;
            }
            const updatedFavorites = [...favorites, id];
            await axios.put('/api/auth/user/favorites',
                { favorites: updatedFavorites },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Error adding to favorites', error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('Token is missing');
                return;
            }
            const response = await axios.get('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFavorites(response.data.favorites);
        } catch (error) {
            console.error('Error fetching favorites', error);
        }
    };

    useEffect(() => {
        const fetchTop100Data = async () => {
            try {
                const response = await axios.get(`/api/crypto/v1/cryptocurrency/listings/latest`, {
                    params: {
                        limit: 100,
                    }
                });

                const ids = response.data.data.map(currency => currency.id).join(',');
                const infoResponse = await axios.get(`/api/crypto/v2/cryptocurrency/info`, {
                    params: {
                        id: ids,
                    }
                });

                const top100WithDetails = response.data.data.map(currency => {
                    const infoData = infoResponse.data.data[currency.id];
                    return {
                        ...currency,
                        logo: infoData.logo,
                        chart: `https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/${currency.id}.png`,
                    };
                });

                setTop100Data(top100WithDetails);
            } catch (error) {
                console.error("Error fetching top 100 data", error);
                setError("Failed to fetch top 100 data. Please try again later.");
            }
            setIsLoading(false);
        };

        fetchTop100Data();
    }, []);

    const handleCardClick = (id) => {
        navigate(`/home?id=${id}`);
    };

    useEffect(() => {
        let timer;
        if (isLoading) {
            timer = setInterval(() => {
                setDots(prevDots => {
                    if (prevDots.length < 3) {
                        return prevDots + '.';
                    } else {
                        return '';
                    }
                });
            }, 1000);
        } else {
            setDots('');
        }

        return () => clearInterval(timer);
    }, [isLoading]);

    return (
        <div className='Top100-page'>
            <div className='header'>
                Top 100 Cryptocurrencies
            </div>
            <div className='body'>
                {isLoading ? <div className='loading'>Loading top 100 data{dots}</div> :
                    <div className='top100-list'>
                        {top100Data.map(currency => (
                            <div key={currency.id} className='currency-card'
                                 onClick={() => handleCardClick(currency.id)}>
                                <div className='currency-header'>
                                    <div className='currency-name'>{currency.name}</div>
                                    <div
                                        className={`currency-price-change ${currency.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}>
                                        <div className='currency-price'>
                                            ${currency.quote.USD.price.toFixed(2)}
                                        </div>
                                        <div className='currency-change'>
                                            {currency.quote.USD.percent_change_24h.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className='currency-symbol'>
                                        <img src={currency.logo} alt={``}/>
                                    </div>
                                </div>
                                <img src={currency.chart} alt={``}
                                     className={`currency-chart ${currency.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}/>
                                <button className='favorite-button' onClick={(e) => {
                                    e.stopPropagation();
                                    addToFavorites(currency.id);
                                }}>Favorite
                                </button>
                            </div>
                        ))}
                    </div>}
            </div>
        </div>
    );
}

export default Top100;
