import logo from './logo.svg';
import './App.css';

function App() {
  const creatureAddress = '0x4De72632CDB3f4422bcB11FcFC6CdB4B8539D277';
  const creatureFactoryAddress = '0xb547f62158E310b2C2C97Ef3DaA2B4664cbC2bB9';
  const creatureAccessoryAddress = '0x7843BeD20f96E961DD0D0b2118aE91F4C625FB80';
  const lootBoxRandomness = '0xABdA2FDa618d735de83c82a0063364eE2Ba137D0';
  const creatureAccessoryLootBox = '0x9624aB7199954f1605c648573c5BF4BE134b2132';
  const creatureAccessoryFactoryAddress = '0x957c8AFb835Fa99a1Fdc45c18d889165bBD05a34';

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
