import { Avatar, Card, CardContent, CardHeader } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import Autocomplete from "@material-ui/lab/Autocomplete";
import axios from "axios";
import { CLByteArray, CLKey, CLOption, CLPublicKey, CLValueBuilder, RuntimeArgs } from 'casper-js-sdk';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from "react";
import { Col, Row } from 'react-bootstrap';
import Spinner from "react-bootstrap/Spinner";
import windowSize from "react-window-size";
import { Some } from "ts-results";
import "../../../assets/css/bootstrap.min.css";
import "../../../assets/css/style.css";
import "../../../assets/plugins/fontawesome/css/all.min.css";
import "../../../assets/plugins/fontawesome/css/fontawesome.min.css";
import { ROUTER_CONTRACT_HASH, ROUTER_PACKAGE_HASH } from '../../../components/blockchain/AccountHashes/Addresses';
import { makeDeploy } from '../../../components/blockchain/MakeDeploy/MakeDeploy';
import { putdeploy } from '../../../components/blockchain/PutDeploy/PutDeploy';
import { createRecipientAddress } from '../../../components/blockchain/RecipientAddress/RecipientAddress';
import { signdeploywithcaspersigner } from '../../../components/blockchain/SignDeploy/SignDeploy';
import HeaderHome from "../../../components/Headers/Header";
import SlippageModal from '../../../components/Modals/SlippageModal';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    badge: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },

    card: {
        minWidth: 250,
    },
    media: {
        height: 0,
        paddingTop: '100%', // 16:9
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
}));
// let RecipientType = CLPublicKey | CLAccountHash | CLByteArray;
function AddLiquidity(props) {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    // let [priceInUSD, setPriceInUSD] = useState(0);
    let [tokenA, setTokenA] = useState();
    let [tokenB, setTokenB] = useState();
    let [tokenAAmount, setTokenAAmount] = useState(0);
    let [tokenBAmount, setTokenBAmount] = useState(0);
    let [approveAIsLoading, setApproveAIsLoading] = useState(false);
    let [approveBIsLoading, setApproveBIsLoading] = useState(false);
    let [activePublicKey, setActivePublicKey] = useState(localStorage.getItem("Address"));
    const [slippage, setSlippage] = useState(0.5);
    const [openSlippage, setOpenSlippage] = useState(false);
    const handleCloseSlippage = () => {
        setOpenSlippage(false);
    };
    const handleShowSlippage = () => {
        setOpenSlippage(true);
    };

    const [tokenList, setTokenList] = useState([])
    const [istokenList, setIsTokenList] = useState(false)
    let [tokenAAmountPercent, setTokenAAmountPercent] = useState(tokenAAmount);
    let [tokenBAmountPercent, setTokenBAmountPercent] = useState(tokenBAmount);
    let [liquidity, setLiquidity] = useState();
    let [isLoading, setIsLoading] = useState(false);
    let [msg, setMsg] = useState("");


    let handleSubmitEvent = (event) => {
        setMsg("");
        event.preventDefault();

    };
    useEffect(() => {
        axios
            .get('/tokensList')
            .then((res) => {
                console.log('resresres', res)
                console.log(res.data.tokens)
                setIsTokenList(true)
                setTokenList(res.data.tokens)
            })
            .catch((error) => {
                console.log(error)
                console.log(error.response)
            })
        // axios
        //     .post("priceconversion", {
        //         symbolforconversion: "CSPR",
        //         symboltoconvertto: "USD",
        //         amount: 1
        //     })
        //     .then((response) => {
        //         console.log("response", response.data.worth.USD);
        //         setPriceInUSD(response.data.worth.USD.price);
        //     })
        //     .catch((error) => {
        //         console.log("response", error.response);
        //     });
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        if (tokenA && tokenB) {
            console.log("tokenA", tokenA);
            console.log("tokenB", tokenB);
            axios
                .get('/getpairlist')
                .then((res) => {
                    console.log('resresres', res)
                    console.log(res.data.pairList)
                    for (let i = 0; i < res.data.pairList.length; i++) {
                        let address0 = res.data.pairList[i].token0.id.toLowerCase();
                        let address1 = res.data.pairList[i].token1.id.toLowerCase();
                        console.log("address0", address0);
                        console.log("address1", address1);
                        if ((address0.toLowerCase() === tokenA.address.slice(5).toLowerCase() && address1.toLowerCase() === tokenB.address.slice(5).toLowerCase()) || (address0.toLowerCase() === tokenB.address.slice(5).toLowerCase() && address1.toLowerCase() === tokenA.address.slice(5).toLowerCase())) {
                            console.log('res.data.', res.data.pairList[i]);
                            setTokenAAmountPercent(parseFloat(res.data.pairList[i].reserve0 / 10 ** 9))
                            setTokenBAmountPercent(parseFloat(res.data.pairList[i].reserve1 / 10 ** 9))

                            let param = {
                                to: Buffer.from(CLPublicKey.fromHex(activePublicKey).toAccountHash()).toString("hex"),
                                pairid: res.data.pairList[i].id
                            }
                            console.log('await Signer.getSelectedPublicKeyBase64()',
                                Buffer.from(CLPublicKey.fromHex(activePublicKey).toAccountHash()).toString("hex"))

                            axios
                                .post('/liquidityagainstuserandpair', param)
                                .then((res1) => {
                                    console.log('liquidityagainstuserandpair', res1)
                                    setLiquidity(parseFloat(res1.data.liquidity))
                                    console.log("res1.data.liquidity", res1.data.liquidity)
                                })
                                .catch((error) => {
                                    console.log(error)
                                    console.log(error.response)
                                })
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                    console.log(error.response)
                })
        }
    }, [activePublicKey, tokenA, tokenB]);

    async function approveMakedeploy(contractHash, amount) {
        console.log('contractHash', contractHash);
        const publicKeyHex = activePublicKey
        if (publicKeyHex !== null && publicKeyHex !== 'null' && publicKeyHex !== undefined) {
            const publicKey = CLPublicKey.fromHex(publicKeyHex);
            const spender = ROUTER_PACKAGE_HASH;
            const spenderByteArray = new CLByteArray(Uint8Array.from(Buffer.from(spender, 'hex')));
            const paymentAmount = 5000000000;
            const runtimeArgs = RuntimeArgs.fromMap({
                spender: createRecipientAddress(spenderByteArray),
                amount: CLValueBuilder.u256(parseInt(amount * 10 ** 9))
            });

            let contractHashAsByteArray = Uint8Array.from(Buffer.from(contractHash.slice(5), "hex"));
            let entryPoint = 'approve';

            // Set contract installation deploy (unsigned).
            let deploy = await makeDeploy(publicKey, contractHashAsByteArray, entryPoint, runtimeArgs, paymentAmount)
            console.log("make deploy: ", deploy);
            try {
                let signedDeploy = await signdeploywithcaspersigner(deploy, publicKeyHex)
                let result = await putdeploy(signedDeploy)
                console.log('result', result);
                let variant = "success";
                enqueueSnackbar('Approved Successfully', { variant });
            }
            catch {
                let variant = "Error";
                enqueueSnackbar('Unable to Approve', { variant });
            }

        }
        else {
            let variant = "error";
            enqueueSnackbar('Connect to Casper Signer Please', { variant });
        }
    }
 
    async function addLiquidityMakeDeploy() {
        setIsLoading(true)
        const publicKeyHex = activePublicKey
        if (publicKeyHex !== null && publicKeyHex !== 'null' && publicKeyHex !== undefined) {
            const publicKey = CLPublicKey.fromHex(publicKeyHex);
            const caller = ROUTER_CONTRACT_HASH;

            const tokenAAddress = tokenA.address;
            const tokenBAddress = tokenB.address;
            const token_AAmount = tokenAAmount;
            const token_BAmount = tokenBAmount;
            const deadline = 1739598100811;
            const paymentAmount = 20000000000;

            console.log('tokenAAddress', tokenAAddress);
            const _token_a = new CLByteArray(
                Uint8Array.from(Buffer.from(tokenAAddress.slice(5), "hex"))
            );
            const _token_b = new CLByteArray(
                Uint8Array.from(Buffer.from(tokenBAddress.slice(5), "hex"))
            );
            const pair = new CLByteArray(
                Uint8Array.from(Buffer.from(tokenBAddress.slice(5), "hex"))
            );


            const runtimeArgs = RuntimeArgs.fromMap({
                token_a: new CLKey(_token_a),
                token_b: new CLKey(_token_b),
                amount_a_desired: CLValueBuilder.u256(parseInt(token_AAmount * 10 ** 9)),
                amount_b_desired: CLValueBuilder.u256(parseInt(token_BAmount * 10 ** 9)),
                amount_a_min: CLValueBuilder.u256(parseInt(token_AAmount * 10 ** 9 - (token_AAmount * 10 ** 9) * slippage / 100)),
                amount_b_min: CLValueBuilder.u256(parseInt(token_BAmount * 10 ** 9 - (token_BAmount * 10 ** 9) * slippage / 100)),
                to: createRecipientAddress(publicKey),
                deadline: CLValueBuilder.u256(deadline),
                pair: new CLOption(Some(new CLKey(pair)))
            });

            let contractHashAsByteArray = Uint8Array.from(Buffer.from(caller, "hex"));
            let entryPoint = 'add_liquidity_js_client';

            // Set contract installation deploy (unsigned).
            let deploy = await makeDeploy(publicKey, contractHashAsByteArray, entryPoint, runtimeArgs, paymentAmount)
            console.log("make deploy: ", deploy);
            try {
                let signedDeploy = await signdeploywithcaspersigner(deploy, publicKeyHex)
                let result = await putdeploy(signedDeploy)
                console.log('result', result);
                let variant = "success";
                enqueueSnackbar('Liquidity Added Successfully', { variant });
                setIsLoading(false)
            }
            catch {
                let variant = "Error";
                enqueueSnackbar('Unable to Add Liquidity', { variant });
                setIsLoading(false)
            }

        }
        else {
            let variant = "error";
            enqueueSnackbar('Connect to Casper Signer Please', { variant });
        }
    }
    return (

        <div className="account-page">
            <div className="main-wrapper">
                <div className="home-section home-full-height">
                    <HeaderHome setActivePublicKey={setActivePublicKey} selectedNav={"Pool"} />
                    <div className="card">
                        <div className="container-fluid">
                            <div
                                className="content"
                                style={{ paddingTop: "150px", minHeight: "100vh" }}
                                position="absolute"
                            >
                                <div className="container-fluid">
                                    <div
                                        className="row"
                                        style={{ height: `${props.windowHeight}`, marginRight: "px" }}
                                    >
                                        <div className="col-md-10 offset-md-1">
                                            <div className="account-content">
                                                <div className="row align-items-center justify-content-center">
                                                    <div className="col-md-12 col-lg-6 login-right">
                                                        <>
                                                            <div className="login-header">
                                                                <h3 style={{ textAlign: "center" }}>Add Liquidity</h3>
                                                                <h3 onClick={handleShowSlippage} style={{ textAlign: 'right' }}><i className="fas fa-cog"></i></h3>
                                                            </div>
                                                            <form onSubmit={handleSubmitEvent}>
                                                                <div className="row">
                                                                    <div className="col-md-12 col-lg-7">
                                                                        <div className="filter-widget">
                                                                            <Autocomplete
                                                                                id="combo-dox-demo"
                                                                                required
                                                                                options={tokenList}
                                                                                disabled={!istokenList}
                                                                                getOptionLabel={(option) =>
                                                                                    option.name + ',' + option.symbol
                                                                                }
                                                                                onChange={(event, value) => {
                                                                                    console.log('event', event);
                                                                                    console.log('value', value);
                                                                                    setTokenA(value)
                                                                                    setTokenBAmount(0)
                                                                                    setTokenAAmount(0)
                                                                                }}
                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        label="Select a token"
                                                                                        variant="outlined"
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-12 col-lg-4">
                                                                        {tokenB && tokenA ? (
                                                                            <input
                                                                                type="number"
                                                                                required
                                                                                value={tokenAAmount}
                                                                                placeholder={0}
                                                                                min={0}
                                                                                step={.01}
                                                                                className="form-control"
                                                                                onChange={(e) => {
                                                                                    // setTokenAAmount(e.target.value)
                                                                                    if (e.target.value >= 0) {
                                                                                        setTokenAAmount(e.target.value)
                                                                                        setTokenBAmount(e.target.value * (tokenAAmountPercent / tokenBAmountPercent).toFixed(5))

                                                                                    } else {
                                                                                        setTokenAAmount(0)
                                                                                        setTokenBAmount(0)
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="number"
                                                                                required
                                                                                value={tokenAAmount}
                                                                                placeholder={0}
                                                                                className="form-control"
                                                                                disabled
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {/* <div style={{ textAlign: 'center', marginTop: '13px' }} className="col-md-12 col-lg-2">
                                                                        {Math.round(tokenAAmount * priceInUSD * 1000) / 1000}$
                                                                    </div> */}
                                                                </div>
                                                                <br></br>
                                                                <div className="row">
                                                                    <div className="col-md-12 col-lg-7">
                                                                        <div className="filter-widget">
                                                                            <Autocomplete
                                                                                id="combo-dox-demo"
                                                                                required
                                                                                options={tokenList}
                                                                                disabled={!istokenList}
                                                                                getOptionLabel={(option) =>
                                                                                    option.name + ',' + option.symbol
                                                                                }
                                                                                onChange={(event, value) => {
                                                                                    console.log('event', event);
                                                                                    console.log('value', value);
                                                                                    setTokenB(value)
                                                                                    setTokenBAmount(0)
                                                                                    setTokenAAmount(0)
                                                                                }}
                                                                                renderInput={(params) => (
                                                                                    <TextField
                                                                                        {...params}
                                                                                        label="Select a token"
                                                                                        variant="outlined"
                                                                                    />
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-12 col-lg-4">
                                                                        {tokenB && tokenA ? (
                                                                            <input
                                                                                type="number"
                                                                                required
                                                                                value={tokenBAmount}
                                                                                placeholder={0}
                                                                                min={0}
                                                                                step={.01}
                                                                                className="form-control"
                                                                                onChange={(e) => {
                                                                                    if (e.target.value >= 0) {
                                                                                        setTokenBAmount(e.target.value)
                                                                                        setTokenAAmount(e.target.value * (tokenBAmountPercent / tokenAAmountPercent).toFixed(5))
                                                                                    }
                                                                                    else {
                                                                                        setTokenAAmount(0)
                                                                                        setTokenBAmount(0)
                                                                                    }

                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="number"
                                                                                required
                                                                                value={tokenBAmount}
                                                                                placeholder={0}
                                                                                style={{ height: '20px' }}
                                                                                disabled
                                                                                height='50'
                                                                                className="form-control"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {/* <div style={{ textAlign: 'center', marginTop: '13px' }} className="col-md-12 col-lg-2">
                                                                        {Math.round(tokenBAmount * priceInUSD * 1000) / 1000}$
                                                                    </div> */}
                                                                </div>
                                                                {tokenA ? (
                                                                    <div className="card">
                                                                        <CardHeader
                                                                            avatar={<Avatar src={tokenA.logoURI} aria-label="Artist" className={classes.avatar} />}
                                                                            title={tokenA.name}
                                                                            subheader={tokenA.symbol}
                                                                        />
                                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                                            <strong>Contract Hash: </strong>{tokenA.address}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                                            <strong>Package Hash: </strong>{tokenA.packageHash}
                                                                        </Typography>
                                                                    </div>
                                                                ) : (null)}
                                                                {tokenB ? (
                                                                    <div className="card">
                                                                        <CardHeader
                                                                            avatar={<Avatar src={tokenB.logoURI} aria-label="Artist" className={classes.avatar} />}
                                                                            title={tokenB.name}
                                                                            subheader={tokenB.symbol}
                                                                        />
                                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                                            <strong>Contract Hash: </strong>{tokenB.address}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="textSecondary" component="p">
                                                                            <strong>Package Hash: </strong>{tokenB.packageHash}
                                                                        </Typography>
                                                                    </div>
                                                                ) : (null)}
                                                                <Row>
                                                                    <Col>
                                                                        {tokenA && tokenAAmount > 0 ? (
                                                                            approveAIsLoading ? (
                                                                                <div className="text-center">
                                                                                    <Spinner
                                                                                        animation="border"
                                                                                        role="status"
                                                                                        style={{ color: "#e84646" }}
                                                                                    >
                                                                                        <span className="sr-only">Loading...</span>
                                                                                    </Spinner>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    className="btn btn-block btn-lg"
                                                                                    onClick={async () => {
                                                                                        setApproveAIsLoading(true)
                                                                                        await approveMakedeploy(tokenA.address, tokenAAmount)
                                                                                        setApproveAIsLoading(false)
                                                                                    }
                                                                                    }
                                                                                >
                                                                                    Approve {tokenA.name}
                                                                                </button>
                                                                            )
                                                                        ) : (null)}
                                                                    </Col>
                                                                    <Col>
                                                                        {tokenB && tokenBAmount > 0 ? (
                                                                            approveBIsLoading ? (
                                                                                <div className="text-center">
                                                                                    <Spinner
                                                                                        animation="border"
                                                                                        role="status"
                                                                                        style={{ color: "#e84646" }}
                                                                                    >
                                                                                        <span className="sr-only">Loading...</span>
                                                                                    </Spinner>
                                                                                </div>
                                                                            ) : (
                                                                                <button
                                                                                    className="btn btn-block btn-lg"
                                                                                    onClick={async () => {
                                                                                        setApproveBIsLoading(true)
                                                                                        await approveMakedeploy(tokenB.address, tokenBAmount)
                                                                                        setApproveBIsLoading(false)
                                                                                    }
                                                                                    }
                                                                                >
                                                                                    Approve {tokenB.name}
                                                                                </button>
                                                                            )
                                                                        ) : (null)}
                                                                    </Col>
                                                                </Row>
                                                                <br></br>
                                                                {tokenA && tokenB ? (
                                                                    <>
                                                                        <Card>
                                                                            <CardContent>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <CardHeader
                                                                                            title={tokenAAmount}
                                                                                        />
                                                                                    </Col>
                                                                                    <Col><CardHeader
                                                                                        avatar={<Avatar src={tokenA.logoURI} aria-label="Artist" className={classes.avatar} />}
                                                                                        title={tokenA.name}
                                                                                    /></Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <CardHeader
                                                                                            title={(tokenBAmount).toFixed(5)}
                                                                                        />
                                                                                    </Col>
                                                                                    <Col>
                                                                                        <CardHeader
                                                                                            avatar={<Avatar src={tokenB.logoURI} aria-label="Artist" className={classes.avatar} />}
                                                                                            title={tokenB.name}
                                                                                        />
                                                                                    </Col>
                                                                                </Row>
                                                                            </CardContent>
                                                                        </Card>
                                                                        <hr />
                                                                        <Card>
                                                                            <CardContent>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <CardHeader style={{ margin: '25px' }}
                                                                                            subheader={`Price`}
                                                                                        />
                                                                                    </Col>
                                                                                    <Col>

                                                                                        <CardHeader
                                                                                            subheader={`1 ${tokenA.name} = ${(tokenAAmountPercent / tokenBAmountPercent).toFixed(5)} ${tokenB.name}`}
                                                                                        />
                                                                                        <CardHeader
                                                                                            subheader={`1 ${tokenB.name} = ${(tokenBAmountPercent / tokenAAmountPercent).toFixed(5)} ${tokenA.name}`}
                                                                                        />
                                                                                    </Col>
                                                                                </Row>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </>
                                                                ) : (
                                                                    null
                                                                )}
                                                                <div className="text-center">
                                                                    <p style={{ color: "red" }}>{msg}</p>
                                                                </div>

                                                                {isLoading ? (
                                                                    <div className="text-center">
                                                                        <Spinner
                                                                            animation="border"
                                                                            role="status"
                                                                            style={{ color: "#e84646" }}
                                                                        >
                                                                            <span className="sr-only">Loading...</span>
                                                                        </Spinner>
                                                                    </div>
                                                                ) : (
                                                                    tokenAAmount !== 0 && tokenBAmount !== 0 && tokenAAmount !== undefined && tokenBAmount !== undefined ? (
                                                                        <button
                                                                            className="btn btn-block btn-lg"
                                                                            onClick={async () => await addLiquidityMakeDeploy()}
                                                                            style={{ marginTop: '20px' }}
                                                                        >
                                                                            Supply
                                                                        </button>
                                                                    ) : activePublicKey === 'null' || activePublicKey === null || activePublicKey === undefined ? (
                                                                        <button
                                                                            className="btn btn-block btn-lg"
                                                                            disabled
                                                                            style={{ marginTop: '20px' }}
                                                                        >
                                                                            Connect to Casper Signer
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-block btn-lg"
                                                                            disabled
                                                                            style={{ marginTop: '20px' }}
                                                                        >
                                                                            Enter an Amount
                                                                        </button>
                                                                    )

                                                                )}
                                                            </form>
                                                            <br></br>
                                                            {tokenA && tokenB && liquidity ? (
                                                                <Card>
                                                                    <CardContent>
                                                                        <h3>Your Position</h3>
                                                                        <Row>
                                                                            <Col>
                                                                                <CardHeader
                                                                                    subheader={`${tokenA.symbol}/${tokenB.symbol}`}
                                                                                />
                                                                            </Col>
                                                                            <Col style={{ textAlign: 'right' }}>
                                                                                <CardHeader
                                                                                    subheader={liquidity / 10 ** 9}
                                                                                />
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col>
                                                                                <CardHeader
                                                                                    subheader={`${tokenA.name}:`}
                                                                                />
                                                                            </Col>
                                                                            <Col style={{ textAlign: 'right' }}>
                                                                                <CardHeader
                                                                                    subheader={(tokenAAmountPercent).toFixed(5)}
                                                                                />
                                                                            </Col>

                                                                        </Row>
                                                                        <Row>
                                                                            <Col>
                                                                                <CardHeader
                                                                                    subheader={`${tokenB.name}:`}
                                                                                />
                                                                            </Col>
                                                                            <Col style={{ textAlign: 'right' }}>
                                                                                <CardHeader
                                                                                    subheader={(tokenBAmountPercent).toFixed(5)}
                                                                                />
                                                                            </Col>

                                                                        </Row>
                                                                    </CardContent>
                                                                </Card>
                                                            ) : (
                                                                null
                                                            )}
                                                        </>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SlippageModal slippage={slippage} setSlippage={setSlippage} show={openSlippage} handleClose={handleCloseSlippage} />
        </div>
    );
}

export default windowSize(AddLiquidity);