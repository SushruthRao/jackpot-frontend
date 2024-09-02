import React, { useEffect, useState, useContext } from "react";

import './App.css';
import { RoundStatusContext, RoundStatusProvider } from './context/RoundStatusContext';
import { supabase } from "./lib/helper/supabaseClient";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };

    getSession();

    // Optional: Use this to listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <RoundStatusProvider>
      <div className="App">
        <h1 className="App-title">JackPot 💰    <span style={{ fontSize: '0.4em' }}> (made by github.com/SushruthRao) </span></h1> 
          
                <div className="main-cont">
                  
                 


                    <div className="Chat-content">
                      {user ? <ChatApp user ={user} /> : <></>}
                    </div>
                    <section className="App-content">
                      {user ? <GameRoom user={user} /> : <SignIn />}
                    </section>

                  </div>

         
            
        
      </div>
    </RoundStatusProvider>
  );
}

// const ChatApp = () => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [user, setUser] = useState(null);
//   const getCurrentUser = async () => {
//     const { data: { session } } = await supabase.auth.getSession();
//     return session?.user;
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);
//     };

//     fetchUser();

//     fetchMessages();

//     const subscription = supabase
//       .channel('public:messages')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
//         setMessages((prev) => [...prev, payload.new]);
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(subscription);
//     };
//   }, []);

//   const fetchMessages = async () => {
//     const { data, error } = await supabase
//       .from('messages')
//       .select('message, user_id, auth (id)')
//       .order('created_at', { ascending: true })
//       .limit(10);

//     if (error) {
//       console.error('Error fetching messages:', error);
//     } else {
//       setMessages(data);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       console.error('User not authenticated');
//       return;
//     }

//     const { error } = await supabase
//       .from('messages')
//       .insert([{ message: newMessage, user_id: user.id }]);

//     if (error) {
//       console.error('Error inserting message:', error);
//     } else {
//       setNewMessage('');
//     }
//   };

//   return (
//     <div>
//       <div style={{ height: '300px', overflowY: 'scroll' }}>
//         {messages.map((msg, index) => (
//           <div key={index}>
//             <strong>{msg.auth.username}:</strong> {msg.message}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Enter your message"
//         />
//         <button type="submit">Send</button>
//       </form>
//     </div>
//   );
// };
const ChatApp = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        // Fetch user name from Supabase
        const { data, error } = await supabase
          .from('gamblers') // Adjust table name as needed
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user name:', error);
        } else {
          setUserName(data?.name || 'Unknown');
        }
      }
    };

    fetchUser();
    fetchMessages();

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('message, user_id, name')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!newMessage.trim()) {
      console.error('Message cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ message: newMessage.trim(), user_id: user.id, name: userName }]);

    if (error) {
      console.error('Error inserting message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div class="chatFlex">
      <div class="chatBoxF">
          <div style={{ height: '100%', overflowY: 'scroll' }}>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.name || 'Unknown'}:</strong> {msg.message || 'No content'}
              </div>
            ))}
          </div>


      </div>
      <div class="submitBoxF">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter your message"
                />
                <button type="submit">Send</button>
              </form>


      </div>
      
    </div>
  );
};




function GameRoom({ user }) {
  return (
    <div className="game-room-container">
      <section className="sign-out-section">
        <SignOut />
      </section>
      <p className="user-email">Authenticated as {user.email}</p>
      <section className="game-section">
        <CoinsAmount userId={user.id} />
      </section>
      <div className="container-inside">
        <RoundActive />
        <RoundEndTime />
      </div>
      <div className="container-inside">
        <JackPotAmount />
        <Winner />
      </div>
      
      <div className="container-inside">
        <Bets />
      </div>
      <BetButton userId={user.id} />
      
    </div>
  );
}

function BetButton({ userId }) {
  const [betAmount, setBetAmount] = useState(5); // Default to 500 coins
  const { setJackpotAmount } = useContext(RoundStatusContext); // Context to update the jackpot amount

  const placeBet = async () => {
    try {
      const response = await fetch('https://jackpot-node.onrender.com/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, betAmount }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Bet placed successfully:', data);
        setJackpotAmount(data.jackpotTotal); // Update the jackpot amount in the context
      } else {
        console.error('Error placing bet:', data.message);
        alert(data.message); // Display an alert with the error message
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bet-button-container">
      <h2>Place Your Bet</h2>
      <select
        value={betAmount}
        onChange={(e) => setBetAmount(Number(e.target.value))}
        className="bet-amount-select"
      >
        <option value={5}>5 Coins</option>
        <option value={10}>10 Coins</option>
        <option value={20}>20 Coins</option>
      </select>
      <button onClick={placeBet} className="place-bet-button">Place Bet</button>
    </div>
  );
}

function JackPotAmount() {
  const { jackpotAmount } = useContext(RoundStatusContext);
  return (
    <div className="jackpot-amount">
      <h2>Jackpot Amount</h2>
      <p>${jackpotAmount}</p>
    </div>
  );
}

function RoundActive() {
  const { roundActive } = useContext(RoundStatusContext);
  return (
    <div className="round-active">
      <h2>{roundActive ? <span style={{color: 'green'}}>Round Active</span> : <span style={{color: 'red'}}>Round Active</span>}</h2>
      <p>{roundActive ? <span style={{color: 'green'}}>Yes</span> : <span style={{color: 'red'}}>No</span>}</p>
    </div>
  );
}

function Winner() {
  const { winner } = useContext(RoundStatusContext);
  const [winnerName, setWinnerName] = useState('');

  useEffect(() => {
    if (winner && winner.userId) {
      const fetchWinnerName = async () => {
        const { data, error } = await supabase
          .from('gamblers')
          .select('name')
          .eq('id', winner.userId)
          .single();

        if (error) {
          console.error('Error fetching winner name:', error);
          return;
        }

        setWinnerName(data.name);
      };

      fetchWinnerName();
    }
  }, [winner]);

  const winnerDisplay = winner ? (
    winnerName ? `${winnerName}, Bet Amount: ${winner.betAmount}` : 'NULL'
  ) : 'No winner yet';

  return (
    <div className="winner">
      <h2>Winner</h2>
      <p>{winnerDisplay}</p>
    </div>
  );
}

function Bets() {
  const { bets } = useContext(RoundStatusContext);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!bets || bets.length === 0) return;

      // Extract user IDs from bets
      const userIds = [...new Set(bets.map(bet => bet.userId))];

      // Fetch usernames for these user IDs
      const { data, error } = await supabase
        .from('gamblers')
        .select('id, name')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching user names:', error.message);
        return;
      }

      // Create a mapping of userId to userName
      const userNameMap = data.reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {});

      setUserNames(userNameMap);
    };

    fetchUserNames();
  }, [bets]);

  if (!bets || bets.length === 0) {
    return (
      <div className="bets">
        <h1>Bets</h1>
        <p>No bets...</p>
      </div>
    );
  }

  return (
    <div className="bets">
      <h2>Bets</h2>
      <ul>
        {bets.map((bet, index) => (
          <li key={index}>
            User Name: {userNames[bet.userId] || 'Loading...'}, Bet Amount: ${bet.betAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}
function RoundEndTime() {
  const { roundEndTime } = useContext(RoundStatusContext);

  // Function to calculate time left
  const calculateTimeLeft = (endTime) => {
    const now = Date.now();
    const difference = endTime - now;
    const timeInSeconds = Math.floor(difference / 1000);
    return timeInSeconds > 0 ? timeInSeconds : 0;
  };

  // Initialize state with the calculated time left
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(roundEndTime));

  useEffect(() => {
    // Update time left every second
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft(roundEndTime));
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [roundEndTime]);

  return (
    <div className="round-end-time">
      <h2>Round EndTime</h2>
      <p>{`Time left: ${timeLeft} seconds`}</p>
    </div>
  );
}

// function RoundEndTime() {
//   const { roundEndTime } = useContext(RoundStatusContext);

//   // Function to calculate time left
//   const calculateTimeLeft = (endTime) => {
//     const now = Date.now();
//     const difference = endTime - now;
//     return Math.max(Math.floor(difference / 1000), 0); // Convert milliseconds to seconds
//   };

//   // Initialize state with the calculated time left
//   const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(roundEndTime));

//   useEffect(() => {
//     // Update time left every second
//     const intervalId = setInterval(() => {
//       setTimeLeft(calculateTimeLeft(roundEndTime));
//     }, 1000);

//     // Clean up interval on unmount
//     return () => clearInterval(intervalId);
//   }, [roundEndTime]);

//   return (
//     <div className="round-end-time">
//       <h2>Round EndTime</h2>
//       <p>{`Time left: ${timeLeft} seconds`}</p>
//     </div>
//   );
// }

function CoinsAmount({ userId }) {
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    // Function to fetch the initial coins amount
    const fetchCoins = async () => {
      const { data, error } = await supabase
        .from('gamblers')
        .select('coins')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching coins:', error);
        return;
      }

      setCoins(data.coins);
    };

    fetchCoins();
    const channel = supabase
      .channel('public:gamblers')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gamblers',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setCoins(payload.new.coins);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="coins-amount">
      <p>Coins Amount: {coins}, [You get free 5 coins every minute upto 50 coins limit]</p> 
    </div>
  );
}

function SignOut() {
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button onClick={signOut} className="sign-out">
      Sign Out
    </button>
  );
}

function SignIn() {
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  return (
    <button onClick={signIn} className="sign-in">
      Sign In with Google
    </button>
  );
}
