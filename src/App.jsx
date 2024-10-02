import "./App.css";
import { useEffect, useState, useRef } from "react";

import Pill from "./components/Pill";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [selectedUserSet, setSelectedUserSet] = useState(new Set());
  const inputRef = useRef(null);

  const controller = new AbortController();
  const fetchUsers = () => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
    fetch(`https://dummyjson.com/users/search?q=${searchTerm}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
      })
      .catch((err) => {
        // console.log(err);
      });
  };

  const debounceFn = (callFn, delay=1000) => {
    let timer;
    return function(...args) {
      if(timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callFn(...args);
      }, delay);
    }
  }

  useEffect(() => {
    debounceFn(fetchUsers, 1000)();
    return () => {
      if (controller) controller.abort();
    };
  }, [searchTerm]);

  const hadleSelectUser = (user) => {
    console.log(user);
    setSelectedUsers([...selectedUsers, user]);
    setSelectedUserSet(new Set([...selectedUserSet, user.email]));
    setSearchTerm("");
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleUserRemove = (user) => {
    //
    const updatedSelectedUsers = selectedUsers.filter(
      (selectedUser) => selectedUser.id !== user.id
    );
    setSelectedUsers(updatedSelectedUsers);

    const updatedEmails = new Set(selectedUserSet);
    updatedEmails.delete(user.email);
    setSelectedUserSet(updatedEmails);
  };

  const handleKeyDown = (event) => {
    if(event.code ==="Backspace" && event.target.value ==='' && selectedUsers.length > 0) {
      handleUserRemove(selectedUsers.at(-1));
    }
  }

  return (
    <div className="user-search-container">
      <div className="user-search-input">
        {/* Pills  */}
        {selectedUsers.map((user) => {
          return (
            <Pill
              key={user.email}
              image={user.image}
              text={`${user.firstName} ${user.lastName}`}
              onClick={() => handleUserRemove(user)}
            />
          );
        })}
        {/* input field with search suggestions */}
        <div>
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for a user"
            onKeyDown={handleKeyDown}
          />
          {/* search suggestions */}
          <ul className="suggestions-list">
            {suggestions?.users?.map((user, index) => {
              return !selectedUserSet.has(user.email) ? (
                <li key={user.email} onClick={() => hadleSelectUser(user)}>
                  <img
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </li>
              ) : (
                <></>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
