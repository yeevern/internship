// import Profile from './Profile.js';

// export default function Gallery() {
//   return (
//     <section>
//       <h1>Amazing scientists</h1>
//       <Profile />
//       <Profile />
//       <Profile />
//     </section>
//   );
// }

"use client";
import { useState, useRef } from "react";

export default function Home() {
  let passwordRef = useRef(1234);
  const [username, setUsername] = useState("Ricky");
  return (
    <div>
      <h1>{username}</h1>
      <h2>{passwordRef.current}</h2>
      <button
        onClick={() => {
          console.log(username);
          console.log("change");
          setUsername("Hello" + Math.random());
          console.log(username);
        }}
      >
        Change username
      </button>
      <button
        onClick={() => {
          console.log("change");
          passwordRef.current = Math.random();
          console.log("your password now", passwordRef.current);
        }}
      >
        Change password
      </button>
    </div>
  );
}