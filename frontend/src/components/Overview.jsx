import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Overview.scss';

function Overview() {
    const [favoritesData, setFavoritesData] = useState([]);
    const [top10Data, setTop10Data] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
    const [isLoadingTop10, setIsLoadingTop10] = useState(true);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const fetchFavoritesData = async () => {
            try {
                const favorites = [
                    { name: 'Bitcoin', id: '1' },
                    { name: 'Ethereum', id: '1027' },
                    { name: 'Litecoin', id: '2' },
                ];

                const ids = favorites.map(currency => currency.id).join(',');
                const response = await axios.get(`/api/crypto/v2/cryptocurrency/quotes/latest`, {
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

                const responses = favorites.map(currency => {
                    const coinData = response.data.data[currency.id];
                    const infoData = infoResponse.data.data[currency.id];
                    return {
                        ...currency,
                        logo: infoData.logo,
                        price: coinData.quote.USD.price,
                        priceChange: coinData.quote.USD.percent_change_24h,
                        chart: `https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/${coinData.id}.png`,
                    };
                });

                setFavoritesData(responses);
            } catch (error) {
                console.error("Error fetching favorites data", error);
                setError("Failed to fetch data. Please try again later.");
            }
            setIsLoadingFavorites(false);
        };

        const fetchTop10Data = async () => {
            try {
                const response = await axios.get(`/api/crypto/v1/cryptocurrency/listings/latest`, {
                    params: {
                        limit: 10,
                    }
                });

                const ids = response.data.data.map(currency => currency.id).join(',');
                const infoResponse = await axios.get(`/api/crypto/v2/cryptocurrency/info`, {
                    params: {
                        id: ids,
                    }
                });

                const top10WithDetails = response.data.data.map(currency => {
                    const infoData = infoResponse.data.data[currency.id];
                    return {
                        ...currency,
                        logo: infoData.logo,
                        chart: `https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/${currency.id}.png`,
                    };
                });

                setTop10Data(top10WithDetails);
            } catch (error) {
                console.error("Error fetching top 10 data", error);
                setError("Failed to fetch top 10 data. Please try again later.");
            }
            setIsLoadingTop10(false);
        };

        fetchFavoritesData();
        fetchTop10Data();
    }, []);

    useEffect(() => {
        let timer;
        if (isLoadingFavorites || isLoadingTop10) {
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
    }, [isLoadingFavorites, isLoadingTop10]);

    return (
        <div className="Overview-page">
            <div className="header">
                <h1>Overview</h1>
            </div>
            <div className="body">
                <div className="favorites">
                    <h2>Favorites</h2>
                    {isLoadingFavorites ? <div className="loading">Loading favorites{dots}</div> :
                    <div className="favorites-list">
                        {favoritesData.map(currency => (
                            <div key={currency.id} className="currency-card">
                                <div className="currency-header">
                                    <div className="currency-name">{currency.name}</div>
                                    <div className={`currency-price-change ${currency.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                        <div className="currency-price">${currency.price.toFixed(2)}</div>
                                        <div className="currency-change">{currency.priceChange.toFixed(2)}%</div>
                                    </div>
                                    <div className="currency-symbol">
                                        <img src={currency.logo} alt={currency.name} />
                                    </div>
                                </div>
                                <img src={currency.chart} alt={`${currency.name} chart`} className={`currency-chart ${currency.priceChange >= 0 ? 'positive' : 'negative'}`} />
                            </div>
                        ))}
                    </div>}
                </div>
                <div className="top10">
                    <h2>Top 10 Cryptocurrencies</h2>
                    {isLoadingTop10 ? <div className="loading">Loading top 10{dots}</div> :
                    <div className="top10-list">
                        {top10Data.map(currency => (
                            <div key={currency.id} className="currency-card">
                                <div className="currency-header">
                                    <div className="currency-name">{currency.name}</div>
                                    <div className={`currency-price-change ${currency.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}>
                                        <div className="currency-price">${currency.quote.USD.price.toFixed(2)}</div>
                                        <div className="currency-change">{currency.quote.USD.percent_change_24h.toFixed(2)}%</div>
                                    </div>
                                    <div className="currency-symbol">
                                        <img src={currency.logo} alt={currency.name} />
                                    </div>
                                </div>
                                <img src={currency.chart} alt={`${currency.name} chart`} className={`currency-chart ${currency.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`} />
                            </div>
                        ))}
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default Overview;
