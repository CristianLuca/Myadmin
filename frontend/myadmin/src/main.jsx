import React from 'react'

import App from './App.jsx'
import './index.css'
import Booking from './Components/Booking.jsx'
import Insights from './Components/Insights.jsx'
import Staff from './Components/Staff.jsx'
import Stock from './Components/Stock.jsx'
import Pos from './Components/Pos.jsx'
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
 
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App></App>
    ),
  },
  {
    path: "/staff",
    element: (
      <Staff/>
    ),
  },
  {
    path: "/pos",
    element: (
      <Pos/>
    ),
  },
  {
    path: "/stock",
    element: (
      <Stock/>
    ),
  },
  {
    path: "/booking",
    element: (
      <Booking/>
    ),
  },
  {
    path: "/insights",
    element: (
      <Insights/>
    ),
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
