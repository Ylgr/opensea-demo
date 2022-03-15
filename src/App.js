import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import Web3 from "web3";
import {
  Row,
  Col,
  Button,
  Container,
  Card,
  Form,
  Tab,
  Tabs,
  Alert,
} from "react-bootstrap";
import CreatureAbi from './abi/Creature.json';
import CreatureAccessoryAbi from './abi/CreatureAccessory.json';
import CreatureLootBoxAbi from './abi/CreatureLootBox.json';
import CreatureAccessoryFactoryAbi from './abi/CreatureAccessoryFactory.json';
import CreatureAccessoryLootBoxAbi from './abi/CreatureAccessoryLootBox.json';
import CreatureFactoryAbi from './abi/CreatureFactory.json';
import LootBoxRandomnessAbi from './abi/LootBoxRandomness.json';

function App() {
  // BSC
  const creatureAddress = '0x7b66280a97D4C706E896C534aBEd8d7Bc3D15492';
  const creatureFactoryAddress = '0x3235197a44c4C6B8747b3103e2B9B11719E869A5';
  const creatureLootBoxAddress = '0xD9Ff70e4282AA3Fa0bFA57fBD3334d7e750FAfc2';
  const creatureAccessoryAddress = '0x3B9dcf4D8Ef37ECe348EF80AD70f1c073aC4Ab60';
  const lootBoxRandomness = '0x16ab070Ca481C1ebC180dB92c2Ae956BAA1bde6b';
  const creatureAccessoryLootBox = '0x91324eA105eA26181d3Bb54AE12DC28616fa17e8';
  const creatureAccessoryFactoryAddress = '0x122FE47593fe359D52AeBa9c5ACE05CBe2d84c67';

  // // Rinkeby
  // const creatureAddress = '0x808Fbc3CAB0140f8128c0376A16E05d7F8Cbc98E';
  // const creatureFactoryAddress = '0x53964BBB3B01e732844d0B595560a72B3018c143';
  // const creatureAccessoryAddress = '0xFa84b3A49F228F45C320A0B9B0Fe05BcC6076bF8';
  // const lootBoxRandomness = '0x8E9244Ff3aA592B466630907d3eFe97fB09cfD81';
  // const creatureAccessoryLootBox = '0x3E8928e8DF6785969aFea283693F34A3505BD1F7';
  // const creatureAccessoryFactoryAddress = '0xe0F69662772C040551AdB7a81f6f0A8982FCC8e1';

  const [web3, setWeb3] = useState(null)
  const [currentAddress, setCurrentAddress] = useState(null)
  const [listLootBox, setListLootBox] = useState([])

  const [contract, setContract] = useState({
    creature: null,
    creatureFactory: null,
    creatureLootBox: null,
    creatureAccessoryAddress: null,
    lootBoxRandomness: null,
    creatureAccessoryLootBox: null,
    creatureAccessoryFactory: null,
  })

  const [creature, setCreature] = useState({})
  const [creatureFactory, setCreatureFactory] = useState({})
  const connectWallet = async () => {
    console.log('adsad')
    if (window.ethereum) {
      console.log('adsad2')

      const ethereum = window.ethereum;
      await ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(ethereum)
      setWeb3(web3)
      const accounts = await web3.eth.getAccounts();
      setCurrentAddress(accounts[0]);
      setContract({
        creature: new web3.eth.Contract(CreatureAbi,creatureAddress),
        creatureFactory: new web3.eth.Contract(CreatureFactoryAbi,creatureFactoryAddress),
        creatureLootBox: new web3.eth.Contract(CreatureLootBoxAbi,creatureLootBoxAddress),
        creatureAccessoryAddress: new web3.eth.Contract(CreatureAccessoryAbi,creatureAccessoryAddress),
        lootBoxRandomness: new web3.eth.Contract(LootBoxRandomnessAbi,lootBoxRandomness),
        creatureAccessoryLootBox: new web3.eth.Contract(CreatureAccessoryLootBoxAbi,creatureAccessoryLootBox),
        creatureAccessoryFactory: new web3.eth.Contract(CreatureAccessoryFactoryAbi,creatureAccessoryFactoryAddress),
      })
    }
  }

  useEffect(() => {
    async function setInfo() {
      if(contract.creature) {
        const totalSupply = await contract.creature.methods.totalSupply().call();
        const tokenURI = [];
        for(let i = 1; i <= Number(totalSupply); i++) {
          tokenURI.push(await contract.creature.methods.tokenURI(i).call());
        }
        setCreature({
          name: await contract.creature.methods.name().call(),
          symbol: await contract.creature.methods.symbol().call(),
          owner: await contract.creature.methods.owner().call(),
          baseTokenURI: await contract.creature.methods.baseTokenURI().call(),
          contractURI:await contract.creature.methods.contractURI().call(),
          totalSupply: totalSupply,
          tokenURI: tokenURI,
        })
      }
      if(contract.creatureFactory) {
        setCreatureFactory({
          name: await contract.creatureFactory.methods.name().call(),
          symbol: await contract.creatureFactory.methods.symbol().call(),
          owner: await contract.creatureFactory.methods.owner().call(),
        })
      }
      if(contract.lootBoxRandomness) {
        setCreatureFactory({
          name: await contract.creature.methods.name().call(),
          symbol: await contract.creature.methods.symbol().call(),
          owner: await contract.creature.methods.owner().call(),
        })
      }
    }
    setInfo();
  }, [contract])

  const mintTo = async (option, address) => {
    const receipt = await contract.creatureFactory.methods.mint(option,address).send({from: currentAddress});
    console.log('mint receipt: ', receipt);
  }

  const loadListLootBox = async () => {
    if(contract.creatureLootBox) {
      const totalSupply = await contract.creatureLootBox.methods.totalSupply().call();
      const tokenIDs = [];
      for(let i = 1; i <= Number(totalSupply); i++) {
        try {
          let checkOwner = await contract.creatureLootBox.methods.ownerOf(i).call();
          console.log(i, checkOwner);
          if (checkOwner === currentAddress) {
            tokenIDs.push(i)
          }
        } catch (e) {
          console.log('error = ', e);
        }
      }
      setListLootBox(tokenIDs);
      console.log('loadListLootBox: ', tokenIDs);
    }
  }

  const unpack = async (tokenID) => {
    const receipt = await contract.creatureLootBox.methods.unpack(tokenID).send({from: currentAddress});
    console.log('unpack receipt: ', receipt);
  }

  const mint1155To = async (option, address) => {
    const receipt = await contract.creatureAccessoryFactory.methods.mint(option,address, 10, "0x0").send({from: currentAddress});
    console.log('mint receipt: ', receipt);
  }

  return (
    <div className="App">
      <Container fluid className="distanced" style={{ maxWidth: "1440px" }}>
        <Row>
          <Col>
            <h1>BIC admin page</h1>
          </Col>
        </Row>
        {currentAddress ? (
            <h3>Current address: {currentAddress}</h3>
        ) : (
            <Row>
              <Col>
                <Button variant="warning" onClick={() => connectWallet()}>
                  Connect wallet
                </Button>
              </Col>
            </Row>
        )}
        <Row>
          <Col>
            <h1>Open Sea</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Creature (ERC 721)</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <h2>Creature Factory</h2>
          </Col>
        </Row>
        <Row><Button onClick={() => mintTo(0, currentAddress)}>Mint single</Button></Row>
        <Row><Button onClick={() => mintTo(1, currentAddress)}>Mint 5</Button></Row>
        <Row><Button onClick={() => mintTo(2, currentAddress)}>Mint loot box</Button></Row>
        <Row><Button onClick={() => loadListLootBox()}>Load loot box</Button></Row>
        <p>List loot box: {listLootBox}</p>
        <Row><Button onClick={() => unpack(listLootBox[0])}>Unpack loot box</Button></Row>
        <Row>
          <Col>
            <h2>Creature Accessory (ERC 1155)</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Creature Accessory Lootbox</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Loot Box Randomness</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Creature Accessory Factory</h2>
          </Col>
        </Row>
        <Row><Button onClick={() => mint1155To(0, currentAddress)}>Mint single</Button></Row>
        <Row><Button onClick={() => mint1155To(1, currentAddress)}>Mint 5</Button></Row>
        <Row><Button onClick={() => mint1155To(2, currentAddress)}>Mint loot box</Button></Row>
        <Row>
          <Col>
            <h1>Wyvern Exchange</h1>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
