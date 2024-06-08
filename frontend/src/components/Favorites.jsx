import React, {useEffect, useState} from "react";
import "./Favorites.scss";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [favoritesData, setFavoritesData] = useState([]);
    const navigate = useNavigate();
    const [dots, setDots] = useState('');
    const [isLoading, setIsLoading] = useState(true);



    const removeFromFavorites = async (id) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('Token is missing');
                return;
            }
            const updatedFavorites = favorites.filter(favorite => favorite !== id);
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
            console.error('Error removing from favorites', error);
        }
    };


    useEffect(() => {
        const fetchFavoritesData = async () => {
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
            }
            try {
                await fetchFavorites();
                const ids = favorites.join(',');
                const response = await axios.get(`/api/crypto/v1/cryptocurrency/quotes/latest`, {
                    params: {
                        id: ids,
                        convert: 'USD',
                    }
                });

                const infoResponse = await axios.get(`/api/crypto/v2/cryptocurrency/info`, {
                    params: {
                        id: ids,
                    }
                });

                const responses = favorites.map((id) => {
                    const coinData = response.data.data[id];
                    const infoData = infoResponse.data.data[id];
                    return {
                        id,
                        logo: infoData.logo,
                        price: coinData.quote.USD.price,
                        priceChange: coinData.quote.USD.percent_change_24h,
                        chart: `https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/${id}.png`,
                    };
                });

                setFavoritesData(responses);
            } catch (error) {
                console.error("Error fetching data", error);
                setError("Failed to fetch data. Please try again later.");
            }
            setIsLoading(false);
        };

        fetchFavoritesData();
    }, []);

    function handleCardClick(id) {
        navigate(`/home?id=${id}`);
    }

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
        <div className='Favorites-page'>
            <div className='header'>
                Favorites
            </div>
            <div className='body'>
                {isLoading ? <div className='loading'>Loading favorites{dots}</div> :
                    <div className='favorites-list'>
                        {favoritesData.length === 0 && !isLoading ? <div className='no-favorites'>No favorites added</div> :
                            favoritesData.map((currency) =>
                                <div key={currency.id} className='currency-card'
                                     onClick={() => handleCardClick(currency.id)}>
                                    <div className='currency-header'>
                                        <div className='currency-name'>
                                            {currency.name}
                                        </div>
                                        <div
                                            className={`currency-price-change ${currency.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                            <div className='currency-price'>
                                                ${currency.price.toFixed(2)}
                                            </div>
                                            <div
                                                className={`currency-change`}>
                                                {currency.priceChange.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className='currency-symbol'>
                                            <img src={currency.logo} alt={``}/>
                                        </div>
                                    </div>
                                    <img src={currency.chart} alt={``}
                                         className={`currency-chart ${currency.priceChange >= 0 ? 'positive' : 'negative'}`}/>
                                    <button className='unfavorite-button'
                                            onClick={() => removeFromFavorites(currency)}>Unfavorite
                                    </button>
                                </div>
                            )}
                    </div>}
            </div>
        </div>
    );
}

export default Favorites;
