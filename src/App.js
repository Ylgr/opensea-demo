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
  const lootBoxRandomnessAddress = '0x16ab070Ca481C1ebC180dB92c2Ae956BAA1bde6b';
  const creatureAccessoryLootBoxAddress = '0x91324eA105eA26181d3Bb54AE12DC28616fa17e8';
  const creatureAccessoryFactoryAddress = '0x122FE47593fe359D52AeBa9c5ACE05CBe2d84c67';

  const [web3, setWeb3] = useState(null)
  const [currentAddress, setCurrentAddress] = useState(null)
  const [listLootBox, setListLootBox] = useState([])

  const [contract, setContract] = useState({
    creature: null,
    creatureFactory: null,
    creatureLootBox: null,
    creatureAccessory: null,
    lootBoxRandomness: null,
    creatureAccessoryLootBox: null,
    creatureAccessoryFactory: null,
  })

  const [refresh, setRefresh] = useState(null)

  const [creature, setCreature] = useState({})
  const [creatureFactory, setCreatureFactory] = useState({})
  const [creatureAccessory, setCreatureAccessory] = useState({})
  const [creatureAccessoryLootBox, setCreatureAccessoryLootBox] = useState({})
  const [creatureAccessoryFactory, setCreatureAccessoryFactory] = useState({})

  const itemAccessoryIds = [0,1,2,3,4,5];
  const lootBoxAccessoryIds = [0,1,2];
  const bscUrl = 'https://testnet.bscscan.com/address/';

  const connectWallet = async () => {
    if (window.ethereum) {

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
        creatureAccessory: new web3.eth.Contract(CreatureAccessoryAbi,creatureAccessoryAddress),
        lootBoxRandomness: new web3.eth.Contract(LootBoxRandomnessAbi,lootBoxRandomnessAddress),
        creatureAccessoryLootBox: new web3.eth.Contract(CreatureAccessoryLootBoxAbi,creatureAccessoryLootBoxAddress),
        creatureAccessoryFactory: new web3.eth.Contract(CreatureAccessoryFactoryAbi,creatureAccessoryFactoryAddress),
      })
    }
  }

  useEffect(() => {
    async function setInfo() {
      if(!currentAddress) connectWallet()

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
      if(contract.creatureAccessory) {
        const items = await Promise.all(itemAccessoryIds.map(async (id) => ({
          id,
          balance: await contract.creatureAccessory.methods.balanceOf(currentAddress, id).call(),
          creator: await contract.creatureAccessory.methods.creators(id).call(),
          totalSupply: await contract.creatureAccessory.methods.totalSupply(id).call(),
        })))
        console.log('items: ', items)

        setCreatureAccessory({
          name: await contract.creatureAccessory.methods.name().call(),
          symbol: await contract.creatureAccessory.methods.symbol().call(),
          owner: await contract.creatureAccessory.methods.owner().call(),
          isApprovedForFactory: await contract.creatureAccessory.methods.isApprovedForAll(currentAddress, creatureAccessoryFactoryAddress).call(),
          items
        })
      }
      if(contract.creatureAccessoryLootBox) {

        const items = await Promise.all(lootBoxAccessoryIds.map(async (id) => ({
          id,
          balance: await contract.creatureAccessoryLootBox.methods.balanceOf(currentAddress, id).call(),
          creator: await contract.creatureAccessoryLootBox.methods.creators(id).call(),
          totalSupply: await contract.creatureAccessoryLootBox.methods.totalSupply(id).call(),
        })))
        setCreatureAccessoryLootBox({
          name: await contract.creatureAccessoryLootBox.methods.name().call(),
          symbol: await contract.creatureAccessoryLootBox.methods.symbol().call(),
          owner: await contract.creatureAccessoryLootBox.methods.owner().call(),
          items
        })
      }
      if(contract.creatureAccessoryFactory) {
        setCreatureAccessoryFactory({
          name: await contract.creatureAccessoryFactory.methods.name().call(),
          symbol: await contract.creatureAccessoryFactory.methods.symbol().call(),
          owner: await contract.creatureAccessoryFactory.methods.owner().call(),
        })
      }
    }
    setInfo().then(() => console.log('update success!'));
  }, [contract, refresh])

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

  const mint1155To = async (option, address, amount = 3) => {
    const receipt = await contract.creatureAccessoryFactory.methods.mint(option,address, amount, "0x0").send({from: currentAddress});
    console.log('mint receipt: ', receipt);
    setRefresh(1)
  }

  const unpack1155LootBox = async (id) => {
    const receipt = await contract.creatureAccessoryLootBox.methods.unpack(id,currentAddress, 3).send({from: currentAddress});
    console.log('unpack receipt: ', receipt);
    setRefresh(2)
  }


  // const approveForFactory = async () => {
  //   const receipt = await contract.creatureAccessory.methods.setApprovalForAll(creatureAccessoryFactoryAddress, true).send({from: currentAddress});
  //   console.log('receipt: ', receipt);
  //   setRefresh(3)
  // }

  return (
    <div className="App">
      <Container fluid className="distanced" style={{ maxWidth: "1440px" }}>
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
            <h1 style={{"color":"powderblue"}}>Open Sea</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Creature (ERC 721)</h2>
            <a href={bscUrl + creatureAddress}>{creatureAddress}</a>
          </Col>
        </Row>

        <Row>
          <Col>
            <h2>Creature Factory</h2>
            <a href={bscUrl + creatureFactoryAddress}>{creatureFactoryAddress}</a>
          </Col>
        </Row>
        <Row><Button onClick={() => mintTo(0, currentAddress)}>Mint single</Button></Row>
        <Row><Button onClick={() => mintTo(1, currentAddress)}>Mint 5</Button></Row>
        <Row><Button onClick={() => mintTo(2, currentAddress)}>Mint loot box</Button></Row>
        <Row><Button onClick={() => loadListLootBox()}>Load loot box</Button></Row>
        <a href={bscUrl + creatureLootBoxAddress}>{creatureLootBoxAddress}</a>
        <p>List loot box: {listLootBox}</p>
        <Row><Button onClick={() => unpack(listLootBox[0])}>Unpack loot box</Button></Row>
        <Row>
          <Col>
            <h1>ERC 1155</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Creature Accessory</h2>
            <a href={bscUrl + creatureAccessoryAddress}>{creatureAccessoryAddress}</a>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>Name: {creatureAccessory.name}</p>
          </Col>
          <Col>
            <p>Symbol: {creatureAccessory.symbol}</p>
          </Col>
          <Col>
            <p>Owner: {creatureAccessory.owner}</p>
          </Col>
        </Row>
        <Row>
          {creatureAccessory.items && creatureAccessory.items.map((e, index) => (<Col key={'lootBoxAccessory' + index}><Card>
            <Card.Body>
              <Card.Title>Id: {e.id}</Card.Title>
              <Card.Text>
                Balance: {e.balance} - Creator: {e.creator} - Total Supply: {e.totalSupply}
              </Card.Text>
            </Card.Body>
          </Card></Col>))}
        </Row>
        <Row>
          <Col>
            <h2>Creature Accessory Lootbox</h2>
            <a href={bscUrl + creatureAccessoryLootBoxAddress}>{creatureAccessoryLootBoxAddress}</a>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>Name: {creatureAccessoryLootBox.name}</p>
          </Col>
          <Col>
            <p>Symbol: {creatureAccessoryLootBox.symbol}</p>
          </Col>
          <Col>
            <p>Owner: {creatureAccessoryLootBox.owner}</p>
          </Col>
        </Row>
        <Row>
          {creatureAccessoryLootBox.items && creatureAccessoryLootBox.items.map((e, index) => (<Col key={'lootBoxAccessory' + index}><Card>
            <Card.Body>
              <Card.Title>Id: {e.id}</Card.Title>
              <Card.Text>
                Balance: {e.balance} - Creator: {e.creator} - Total Supply: {e.totalSupply}
              </Card.Text>
              <Button variant="primary" onClick={() => unpack1155LootBox(e.id)}>Unpack 3</Button>
            </Card.Body>
          </Card></Col>))}
        </Row>
        <Row>
          <Col>
            <h2>Creature Accessory Factory</h2>
            <a href={bscUrl + creatureAccessoryFactoryAddress}>{creatureAccessoryFactoryAddress}</a>
          </Col>
        </Row>

        <Row>
          <Col>
            <p>Name: {creatureAccessoryFactory.name}</p>
          </Col>
          <Col>
            <p>Symbol: {creatureAccessoryFactory.symbol}</p>
          </Col>
          <Col>
            <p>Owner: {creatureAccessoryFactory.owner}</p>
          </Col>
        </Row>
        <Row><Button onClick={() => mint1155To(0, currentAddress)}>Mint 3 common item</Button></Row>
        <Row><Button onClick={() => mint1155To(1, currentAddress)}>Mint 3 rare item</Button></Row>
        <Row><Button onClick={() => mint1155To(2, currentAddress)}>Mint 3 epic item</Button></Row>
        <Row><Button onClick={() => mint1155To(3, currentAddress)}>Mint 3 legendary item</Button></Row>
        <Row><Button onClick={() => mint1155To(4, currentAddress)}>Mint 3 divine item</Button></Row>
        <Row><Button onClick={() => mint1155To(5, currentAddress)}>Mint 3 hidden item</Button></Row>
        <Row><Button onClick={() => mint1155To(6, currentAddress)}>Mint 3 basic loot box</Button></Row>
        <Row><Button onClick={() => mint1155To(7, currentAddress)}>Mint 3 premium loot box</Button></Row>
        <Row><Button onClick={() => mint1155To(8, currentAddress)}>Mint 3 gold loot box</Button></Row>
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
