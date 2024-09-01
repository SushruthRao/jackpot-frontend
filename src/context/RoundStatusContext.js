// context/JackpotContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const RoundStatusContext = createContext();

export const RoundStatusProvider = ({ children }) => {
    const [jackpotAmount, setJackpotAmount] = useState(0);
    const [roundActive, setRoundActive] = useState(false);
    const [winner, setWinner] = useState(0);
    const [bets, setBets] = useState(null);
    const [roundEndTime, setRoundEndTime] = useState(0);

    useEffect(() => {
        const fetchRoundStatus = async () => {
            try {
                const response = await axios.get('https://jackpot-node.onrender.com/round-status');
                const data = await response.data;
                console.log('Fetched round status:', data);
                console.log('Response status:', response.status); // Check status code
                console.log('Response data:', response.data);
                setJackpotAmount(data.jackpotTotal || 0);
                setRoundActive(data.roundActive || false);
                setWinner(data.winner || 0);
                setBets(data.bets || null);
                setRoundEndTime(data.roundEndTime || 0);
            } catch (error) {
                console.error('Error fetching round status:', error);
            }
        };

        fetchRoundStatus();
        const intervalId = setInterval(fetchRoundStatus, 2000); // Poll every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return (
        <RoundStatusContext.Provider value={{ jackpotAmount, roundActive, winner, bets, roundEndTime }}>
            {children}
        </RoundStatusContext.Provider>
    );
};
