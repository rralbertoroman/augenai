import React from 'react';
import Header from './components/layout/header';
import Dashboard from './components/layout/dashboard';
import Footer from './components/layout/footer';

const App: React.FC = () => {
  return (
    <div className='flex flex-col w-full h-screen'>
      <Header/>
      <Dashboard/>
      <Footer/>
    </div>
  )
}

export default App
