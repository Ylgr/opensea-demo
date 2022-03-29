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
import WyvernExchangeAbi from './abi/WyvernExchange.json';
import WyvernProxyRegistryAbi from './abi/WyvernProxyRegistry.json';
import WyvernTokenTransferProxyAbi from './abi/WyvernTokenTransferProxy.json';
import BeinChainAbi from './abi/BeinChain.json';
import {WyvernSchemaName} from "./utils/types";
import * as WyvernSchemas from 'wyvern-schemas';
import {encodeBuy, encodeSell} from "wyvern-schemas";

const BigNumber = require('bignumber.js')

function App() {
  // BSC
  const creatureAddress = '0x5A60B59f97DD2cF79FB6e3Fa02615490ba0515ed';
  const creatureFactoryAddress = '0xa9A5e9a97609b66aF4e61f7D56A56D91FCC1477c';
  const creatureLootBoxAddress = '0x1f71d5cAEe1d1d2e90882259499c6deb16229765';
  const creatureAccessoryAddress = '0xe356c144377a55C052dC0E4541b7aDBb7DaC9d2f';
  const lootBoxRandomnessAddress = '0x17873f25764A23602fbea48C0Eb88f259479DECD';
  const creatureAccessoryLootBoxAddress = '0xC9eB2CA1b9228BCe443d70cA5ec6BA0124f9f252';
  const creatureAccessoryFactoryAddress = '0x844faf6746e4C4cc675129094DfA030E2908923C';

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
    wyvernExchange: null,
    wyvernProxyRegistry: null,
    wyvernTokenTransferProxy: null,
    bic: null,
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

  const wyvernRegistryProxyAddress = '0x588CcA53d3039c934c52f523867a0ecf05a86c45';
  // const wyvernExchangeAddress = '0x48a1dA2E3024dAc9601846ae3Ff5a4E4b3205BB9';
  // const wyvernTokenTransferProxyAddress = '0x9AE88C95916D403CaB301bDceb5638565F2860C6';
  // const bicAddress = '0x43b67834264a9C9B18692A91e5C86b5f6dBAbA21';
  const wyvernExchangeAddress = '0xc995eD4282f247B739f8103583688c33f3B578A0';
  const wyvernTokenTransferProxyAddress = '0x8593C8403C1C7Ac6C6F00062f648EA5fd2cfb482';
  const bicAddress = '0x25E59A6309826446565C96c4780f145cA2d3581f';
  // const bicAddress = '0x5Ee48c5bb1823f35Fc7659644E988f15f9611AD0';
  const sellAddress = '0xADdbCB89bD7e1D2F7A9AC95Ab0b8F5679326c4d3';
  const buyAddress = '0x8E3ba900481b8d815889FDde0a9A9d78AC692ECD'; //'0x8E3ba900481b8d815889FDde0a9A9d78AC692ECD';
  const proxyTargetBuy = '0xeCbe315f59dD43B8c83aB771FF7f16f9A00d5C40';
  const proxyTargetSell = '0x304c667F125056c2db5d1b25c6D030aE43E8a8b7';

  const [wyvernExchange, setWyvernExchange] = useState({});
  const [ordersExchange, setOrdersExchange] = useState([]);

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
        wyvernExchange: new web3.eth.Contract(WyvernExchangeAbi, wyvernExchangeAddress),
        wyvernProxyRegistry: new web3.eth.Contract(WyvernProxyRegistryAbi, wyvernRegistryProxyAddress),
        wyvernTokenTransferProxy: new web3.eth.Contract(WyvernTokenTransferProxyAbi, wyvernTokenTransferProxyAddress),
        bic: new web3.eth.Contract(BeinChainAbi, bicAddress)
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
      if(contract.wyvernExchange) {
        setWyvernExchange({
          tokenProxyTransfer: await contract.wyvernExchange.methods.tokenTransferProxy().call(),
          minimumTakerProtocolFee: await contract.wyvernExchange.methods.minimumTakerProtocolFee().call(),
          protocolFeeRecipient: await contract.wyvernExchange.methods.protocolFeeRecipient().call(),
          exchangeToken: await contract.wyvernExchange.methods.exchangeToken().call(),
          inverseBasisPoint: await contract.wyvernExchange.methods.INVERSE_BASIS_POINT().call(),
          registry: await contract.wyvernExchange.methods.registry().call(),
          owner: await contract.wyvernExchange.methods.owner().call(),
          proxyCurrentAddress: await contract.wyvernProxyRegistry.methods.proxies(currentAddress).call(),
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


  const approveForFactory = async () => {
    const receipt = await contract.creatureAccessory.methods.setApprovalForAll(creatureAccessoryFactoryAddress, true).send({from: currentAddress});
    console.log('receipt: ', receipt);
    setRefresh(3)
  }

  const loadOrder = async () => {
    console.log('loading orders ....')
    const currentBlock = await web3.eth.getBlockNumber()

    const logsPartOne = await contract.wyvernExchange.getPastEvents('OrderApprovedPartOne', {
      fromBlock: currentBlock-5000,
      toBlock: currentBlock,
    })
    const logsPartTwo = await contract.wyvernExchange.getPastEvents('OrderApprovedPartTwo', {
      fromBlock: currentBlock-5000,
      toBlock: currentBlock,
    })

    setOrdersExchange(
        logsPartOne.map((partOne, index) => {
          const partOneValues = partOne.returnValues;
          const partTwoValues = logsPartTwo[index].returnValues;
          console.log('partOneValues: ', partOneValues)
          console.log('partTwoValues: ', partTwoValues)
          return {
            exchange: partOneValues.exchange,
            feeMethod: partOneValues.feeMethod,
            feeRecipient: partOneValues.feeRecipient,
            hash: partOneValues.hash,
            maker: partOneValues.maker,
            makerProtocolFee: partOneValues.makerProtocolFee,
            makerRelayerFee: partOneValues.makerRelayerFee,
            saleKind: partOneValues.saleKind,
            side: partOneValues.side,
            taker: partOneValues.taker,
            takerProtocolFee: partOneValues.takerProtocolFee,
            takerRelayerFee: partOneValues.takerRelayerFee,
            target: partOneValues.target,
            basePrice: partTwoValues.basePrice,
            calldata: partTwoValues.calldata,
            expirationTime: partTwoValues.expirationTime,
            extra: partTwoValues.extra,
            howToCall: partTwoValues.howToCall,
            listingTime: partTwoValues.listingTime,
            orderbookInclusionDesired: partTwoValues.orderbookInclusionDesired,
            paymentToken: partTwoValues.paymentToken,
            replacementPattern: partTwoValues.replacementPattern,
            salt: partTwoValues.salt,
            staticExtradata: partTwoValues.staticExtradata,
            staticTarget: partTwoValues.staticTarget,
          }
        })
    )

  }

  const createOrder = async () => {
    const order = makeOrder(wyvernExchangeAddress);
    const recipt = await contract.wyvernExchange.methods.approveOrder_(
        [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
        [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
        order.feeMethod,
        order.side,
        order.saleKind,
        order.howToCall,
        order.calldata,
        order.replacementPattern,
        order.staticExtradata,
        true
    ).send({from: currentAddress})
    console.log('recipt: ', recipt)
  }

  // 0xADdbCB89bD7e1D2F7A9AC95Ab0b8F5679326c4d3 - sell
  // 0x8E3ba900481b8d815889FDde0a9A9d78AC692ECD - buy

  const createSellOrder1 = async () => {
    // let buy = makeOrder(wyvernExchangeAddress, false)
    let sell = makeOrderDetail(wyvernExchangeAddress, true, sellAddress, '0x0000000000000000000000000000000000000000', proxyTargetSell)
    sell.side = 1
    // buy.feeMethod = 1
    sell.feeMethod = 1
    // buy.paymentToken = bicAddress
    sell.paymentToken = bicAddress
    // buy.basePrice = new BigNumber(10000).toString()
    sell.basePrice = new BigNumber(10000).toString()
    sell.makerProtocolFee = new BigNumber(100).toString()
    sell.makerRelayerFee = new BigNumber(100).toString()

    ///////////////////////////
    const schema = _getSchema()
    const sellSpec = encodeSell(
        schema,
        {address: creatureAccessoryLootBoxAddress, id: '2', quantity: '3'},
        sellAddress,
    )

    console.log('sellSpec: ', sellSpec)

    sell.calldata = sellSpec.calldata
    sell.replacementPattern = sellSpec.replacementPattern
    sell.target = sellSpec.target
///////////////////////////
    const sellOrder = await contract.wyvernExchange.methods.approveOrder_(
        [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        sell.feeMethod,
        sell.side,
        sell.saleKind,
        sell.howToCall,
        sell.calldata,
        sell.replacementPattern,
        sell.staticExtradata,
        true
    ).send({from: sellAddress})


    const sellHash = hashOrder(sell)
    let sellSignature = await web3.eth.sign(sellHash, sellAddress)
    console.log('sellSignature = ', sellSignature);
    sellSignature = sellSignature.substr(2)
    const sr = '0x' + sellSignature.slice(0, 64)
    const ss = '0x' + sellSignature.slice(64, 128)
    const sv = 27 + parseInt('0x' + sellSignature.slice(128, 130), 16)
  }

  const createBuyOrder2 = async () => {
    // await contract.wyvernProxyRegistry.methods.registerProxy().send({from: currentAddress})
    //
    // await contract.wyvernProxyRegistry.methods.grantInitialAuthentication(wyvernExchangeAddress).send({from: currentAddress})
    // return
    let buy = makeOrderDetail(wyvernExchangeAddress, false, buyAddress, sellAddress, proxyTargetSell)
    let sell = makeOrderDetail(wyvernExchangeAddress, true, sellAddress, '0x0000000000000000000000000000000000000000', proxyTargetSell)
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    // buy.paymentToken = '0x0000000000000000000000000000000000000000'
    // sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.paymentToken = bicAddress
    sell.paymentToken = bicAddress
    buy.basePrice = new BigNumber(10000).toString()
    sell.basePrice = new BigNumber(10000).toString()
    sell.makerProtocolFee = new BigNumber(100).toString()
    sell.makerRelayerFee = new BigNumber(100).toString()

    ///////////////////////////
    const schema = _getSchema()
    const sellSpec = encodeSell(
        schema,
        {address: creatureAccessoryLootBoxAddress, id: '2', quantity: '3'},
        sellAddress,
    )
    const buySpec = encodeBuy(
        schema,
        {address: creatureAccessoryLootBoxAddress, id: '2', quantity: '3'},
        buyAddress,
    );
    console.log('sellSpec: ', sellSpec)
    console.log('buySpec: ', buySpec)

    buy.calldata = buySpec.calldata
    buy.replacementPattern = buySpec.replacementPattern
    buy.target = buySpec.target

    sell.calldata = sellSpec.calldata
    sell.replacementPattern = sellSpec.replacementPattern
    sell.target = sellSpec.target
///////////////////////////


    const allowance = await contract.bic.methods.allowance(currentAddress, wyvernTokenTransferProxyAddress).call()
    console.log('allowance: ', allowance);
    if(allowance == 0) {
      await contract.bic.methods.approve(wyvernTokenTransferProxyAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({from: currentAddress});
    }

    const canOderMatch = await contract.wyvernExchange.methods.ordersCanMatch_(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata
    ).call();
    console.log('canOderMatch: ', canOderMatch);

    const buyHash = hashOrder(buy)
    const sellHash = hashOrder(sell)

    let buySignature = await web3.eth.sign(buyHash, currentAddress)
    buySignature = buySignature.substr(2)
    const br = '0x' + buySignature.slice(0, 64)
    const bs = '0x' + buySignature.slice(64, 128)
    const bv = 27 + parseInt('0x' + buySignature.slice(128, 130), 16)
    // let sellSignature = await web3.eth.sign(sellHash, currentAddress)
    let sellSignature = '0xfcc5484eefb769cc2412fad9e17e16e4910c4fb3a0f497e24a5a70ec954e2785725a6086d104cf2cab0327ac44e04282b0fab28458c63994f2c8887944965afa1b';
    sellSignature = sellSignature.substr(2)
    const sr = '0x' + sellSignature.slice(0, 64)
    const ss = '0x' + sellSignature.slice(64, 128)
    const sv = 27 + parseInt('0x' + sellSignature.slice(128, 130), 16)

    const autoMatchingOrder =  await contract.wyvernExchange.methods.atomicMatch_(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata,
        [bv, sv],
        [br, bs, sr, ss, '0x0000000000000000000000000000000000000000000000000000000000000000']
    ).send({from: currentAddress})
    console.log('autoMatchingOrder: ', autoMatchingOrder);
  }

  const createMatchOrder3 = async () => {

  }


  const createTwoOrderThatMatchAuto = async () => {

    // await contract.wyvernProxyRegistry.methods.registerProxy().send({from: currentAddress})
    //
    // await contract.wyvernProxyRegistry.methods.grantInitialAuthentication(wyvernExchangeAddress).send({from: currentAddress})

    let buy = makeOrder(wyvernExchangeAddress, false)
    let sell = makeOrder(wyvernExchangeAddress, true)
    sell.side = 1
    buy.feeMethod = 1
    sell.feeMethod = 1
    // buy.paymentToken = '0x0000000000000000000000000000000000000000'
    // sell.paymentToken = '0x0000000000000000000000000000000000000000'
    buy.paymentToken = bicAddress
    sell.paymentToken = bicAddress
    buy.basePrice = new BigNumber(10000).toString()
    sell.basePrice = new BigNumber(10000).toString()
    sell.makerProtocolFee = new BigNumber(100).toString()
    sell.makerRelayerFee = new BigNumber(100).toString()

    ///////////////////////////
    const schema = _getSchema()
    const sellSpec = encodeSell(
        schema,
        {address: creatureAccessoryLootBoxAddress, id: '2', quantity: '3'},
        currentAddress,
    )
    const buySpec = encodeBuy(
        schema,
        {address: creatureAccessoryLootBoxAddress, id: '2', quantity: '3'},
        currentAddress,
    );
    console.log('sellSpec: ', sellSpec)
    console.log('buySpec: ', buySpec)

    buy.calldata = buySpec.calldata
    buy.replacementPattern = buySpec.replacementPattern
    buy.target = buySpec.target

    sell.calldata = sellSpec.calldata
    sell.replacementPattern = sellSpec.replacementPattern
    sell.target = sellSpec.target
///////////////////////////

    // const callFunc = contract.creature.methods.transferFrom('0xF4402fE2B09da7c02504DC308DBc307834CE56fE', '0xeaBcd21B75349c59a4177E10ed17FBf2955fE697', 20).encodeABI()
    // buy.calldata = callFunc;
    // sell.calldata = callFunc;


    const allowance = await contract.bic.methods.allowance(currentAddress, wyvernTokenTransferProxyAddress).call()
    console.log('allowance: ', allowance);
    if(allowance == 0) {
      await contract.bic.methods.approve(wyvernTokenTransferProxyAddress, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({from: currentAddress});
    }

    const canOderMatch = await contract.wyvernExchange.methods.ordersCanMatch_(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata
    ).call();
    console.log('canOderMatch: ', canOderMatch);

    // const buyOrder = await contract.wyvernExchange.methods.approveOrder_(
    //     [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
    //     [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt],
    //     buy.feeMethod,
    //     buy.side,
    //     buy.saleKind,
    //     buy.howToCall,
    //     buy.calldata,
    //     buy.replacementPattern,
    //     buy.staticExtradata,
    //     true
    // ).send({from: currentAddress})
    // console.log('buyOrder: ', buyOrder)
    //
    // const sellOrder = await contract.wyvernExchange.methods.approveOrder_(
    //     [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
    //     [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
    //     sell.feeMethod,
    //     sell.side,
    //     sell.saleKind,
    //     sell.howToCall,
    //     sell.calldata,
    //     sell.replacementPattern,
    //     sell.staticExtradata,
    //     true
    // ).send({from: currentAddress})

    const buyHash = hashOrder(buy)
    const sellHash = hashOrder(sell)

    let buySignature = await web3.eth.sign(buyHash, currentAddress)
    buySignature = buySignature.substr(2)
    const br = '0x' + buySignature.slice(0, 64)
    const bs = '0x' + buySignature.slice(64, 128)
    const bv = 27 + parseInt('0x' + buySignature.slice(128, 130), 16)
    let sellSignature = await web3.eth.sign(sellHash, currentAddress)
    console.log('sellSignature ', sellSignature)
    sellSignature = sellSignature.substr(2)
    const sr = '0x' + sellSignature.slice(0, 64)
    const ss = '0x' + sellSignature.slice(64, 128)
    const sv = 27 + parseInt('0x' + sellSignature.slice(128, 130), 16)

    const autoMatchingOrder =  await contract.wyvernExchange.methods.atomicMatch_(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata,
        [bv, sv],
        [br, bs, sr, ss, '0x0000000000000000000000000000000000000000000000000000000000000000']
    ).send({from: currentAddress})
    console.log('autoMatchingOrder: ', autoMatchingOrder);
  }

  const hashOrder = (order) => {
    return Web3.utils.soliditySha3(
        {type: 'address', value: order.exchange},
        {type: 'address', value: order.maker},
        {type: 'address', value: order.taker},
        {type: 'uint', value: new BigNumber(order.makerRelayerFee)},
        {type: 'uint', value: new BigNumber(order.takerRelayerFee)},
        {type: 'uint', value: new BigNumber(order.takerProtocolFee)},
        {type: 'uint', value: new BigNumber(order.takerProtocolFee)},
        {type: 'address', value: order.feeRecipient},
        {type: 'uint8', value: order.feeMethod},
        {type: 'uint8', value: order.side},
        {type: 'uint8', value: order.saleKind},
        {type: 'address', value: order.target},
        {type: 'uint8', value: order.howToCall},
        {type: 'bytes', value: order.calldata},
        {type: 'bytes', value: order.replacementPattern},
        {type: 'address', value: order.staticTarget},
        {type: 'bytes', value: order.staticExtradata},
        {type: 'address', value: order.paymentToken},
        {type: 'uint', value: new BigNumber(order.basePrice)},
        {type: 'uint', value: new BigNumber(order.extra)},
        {type: 'uint', value: new BigNumber(order.listingTime)},
        {type: 'uint', value: new BigNumber(order.expirationTime)},
        {type: 'uint', value: order.salt}
    ).toString('hex')
  }

  const _getSchema = () => {
    const schemaName_ = 'ERC1155';
    const schema = WyvernSchemas.schemas['main'].filter(
        (s) => s.name == schemaName_
    )[0];

    if (!schema) {
      throw new Error(
          `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`
      );
    }
    return schema;
  }

  const makeOrder = (exchange, isMaker) => ({
    exchange: exchange,
    maker: currentAddress,
    taker: currentAddress,
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeRecipient: isMaker ? currentAddress : '0x0000000000000000000000000000000000000000',
    feeMethod: 0,
    side: 0,
    saleKind: 0,
    target: '0x304c667F125056c2db5d1b25c6D030aE43E8a8b7',
    howToCall: 0,
    calldata: '0x',
    replacementPattern: '0x',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: currentAddress,
    basePrice: new BigNumber(0).toString(),
    extra: 0,
    listingTime: 0,
    expirationTime: 0,
    salt: new BigNumber(1).toString()
  })

  const makeOrderDetail = (exchange, isMaker, makerAddress, takerAddress, proxyAddressTarget) => ({
    exchange: exchange,
    maker: makerAddress,
    taker: takerAddress,
    makerRelayerFee: 0,
    takerRelayerFee: 0,
    makerProtocolFee: 0,
    takerProtocolFee: 0,
    feeRecipient: isMaker ? makerAddress : '0x0000000000000000000000000000000000000000',
    feeMethod: 0,
    side: 0,
    saleKind: 0,
    target: proxyAddressTarget,
    howToCall: 0,
    calldata: '0x',
    replacementPattern: '0x',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: makerAddress,
    basePrice: new BigNumber(0).toString(),
    extra: 0,
    listingTime: 0,
    expirationTime: 0,
    salt: new BigNumber(1).toString()
  })

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
        <Row><Button onClick={() => approveForFactory()}>Approve</Button></Row>
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
        <Row>
          <Col>
            <p>Token proxy transfer: {wyvernExchange.tokenProxyTransfer}</p>
          </Col>
          <Col>
            <p>Minimum take proxy fee: {wyvernExchange.minimumTakerProtocolFee}</p>
          </Col>
          <Col>
            <p>Protocol fee receipt: {wyvernExchange.protocolFeeRecipient}</p>
          </Col>
          <Col>
            <p>Exchange token: {wyvernExchange.exchangeToken}</p>
          </Col>
          <Col>
            <p>Inverse basic point: {wyvernExchange.inverseBasisPoint}</p>
          </Col>
          <Col>
            <p>Registry: {wyvernExchange.registry}</p>
          </Col>
          <Col>
            <p>Owner: {wyvernExchange.owner}</p>
            <p>ProxyCurrentAddress: {wyvernExchange.proxyCurrentAddress}</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button onClick={() => createOrder()}>Create order</Button>
            <Button onClick={() => createTwoOrderThatMatchAuto()}>Create Two Order That Match Auto</Button>
            <Button onClick={() => loadOrder()}>Load order</Button>
            <Button onClick={() => createSellOrder1()}>Sell order1</Button>
            <Button onClick={() => createBuyOrder2()}>Buy order2</Button>
          </Col>
        </Row>
        {ordersExchange && ordersExchange.map(e => (<Row key={e.hash}>
          <Col>
            <p>hash: {e.hash}</p>
            <p>exchange: {e.exchange}</p>
            <p>feeMethod: {e.feeMethod}</p>
            <p>feeRecipient: {e.feeRecipient}</p>
            <p>maker: {e.maker}</p>
            <p>makerProtocolFee: {e.makerProtocolFee}</p>
            <p>makerRelayerFee: {e.makerRelayerFee}</p>
            <p>saleKind: {e.saleKind}</p>
            <p>side: {e.side}</p>
            <p>taker: {e.taker}</p>
            <p>takerProtocolFee: {e.takerProtocolFee}</p>
            <p>takerRelayerFee: {e.takerRelayerFee}</p>
            <p>target: {e.target}</p>
            <p>basePrice: {e.basePrice}</p>
            <p>calldata: {e.calldata}</p>
            <p>expirationTime: {e.expirationTime}</p>
            <p>extra: {e.extra}</p>
            <p>howToCall: {e.howToCall}</p>
            <p>listingTime: {e.listingTime}</p>
            <p>orderbookInclusionDesired: {e.orderbookInclusionDesired}</p>
            <p>paymentToken: {e.paymentToken}</p>
            <p>replacementPattern: {e.replacementPattern}</p>
            <p>salt: {e.salt}</p>
            <p>staticExtradata: {e.staticExtradata}</p>
            <p>staticTarget: {e.staticTarget}</p>
          </Col>
        </Row>))}

      </Container>
    </div>
  );
}

export default App;
