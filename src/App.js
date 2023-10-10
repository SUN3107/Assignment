import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [groupingOption, setGroupingOption] = useState('status');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then((response) => response.json())
      .then((data) => {
        // Assuming each ticket object contains a 'user' field with user data
        setTickets(data.tickets.map(ticket => ({
          ...ticket,
          user: data.users.find(user => user.id === ticket.userId)
        })));
      });
  }, []);

  const groupTickets = () => {
    let groupedTickets = {};

    tickets.forEach((ticket) => {
      let key;
      if (groupingOption === 'user' && ticket.user) {
        key = ticket.user.name;
      }else if (groupingOption === 'priority') {
        key = ticket.priority === 0 ? 'No Priority' : (ticket.priority === 1 ? 'Low': (ticket.priority === 2 ? 'Medium': (ticket.priority === 3 ? 'High': 'Urgent')));
      }
      else {
        key = ticket[groupingOption];
      }
      
      if (!groupedTickets[key]) {
        groupedTickets[key] = [];
      }
      groupedTickets[key].push(ticket);
    });

    return groupedTickets;
  };

  const sortedTickets = () => {
    const grouped = groupTickets();
    for (const key in grouped) {
      grouped[key].sort((a, b) => {
        if (sortBy === 'priority') {
          return b.priority - a.priority;
        } else if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }
    return grouped;
  };

  const groupedAndSortedTickets = sortedTickets();

  useEffect(() => {
    // Save groupingOption and sortBy states to local storage
    localStorage.setItem('groupingOption', groupingOption);
    localStorage.setItem('sortBy', sortBy);
  }, [groupingOption, sortBy]);

  return (
    <div className="App">
      <div className="options">
        <label>
          Group By:
          <select value={groupingOption} onChange={(e) => setGroupingOption(e.target.value)}>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="user">User</option>
          </select>
        </label>
        <label>
          Sort By:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
      <div className="kanban-board">
      <div className="columns-container">
          {Object.keys(groupedAndSortedTickets).map((group, index) => (
            <div className="column" key={index}>
              <h2>{group}</h2>
              {groupedAndSortedTickets[group].map((ticket) => (
                <div className={`ticket priority-${ticket.priority}`} key={ticket.id}>
                  <div class="row-container">
                    <div class="id">{ticket.id}</div>
                    <div>{ticket.user && <p>{ticket.user.name}</p>}</div>
                  </div>
                  <h3>{ticket.title}</h3>
                  <p>Status: {ticket.status}</p>
                  <p>Tag: {ticket.tag}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
