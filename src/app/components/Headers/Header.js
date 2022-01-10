import Avatar from '@material-ui/core/Avatar';
import {
  Signer
} from 'casper-js-sdk';
import Cookies from "js-cookie";
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";
import Logo from "../../assets/img/cspr.png";
import "../../assets/plugins/fontawesome/css/all.min.css";
import "../../assets/plugins/fontawesome/css/fontawesome.min.css";

function HeaderHome(props) {
  const { enqueueSnackbar } = useSnackbar();
  let [menuOpenedClass, setMenuOpenedClass] = useState();
  let [signerLocked, setSignerLocked] = useState()
  let [signerConnected, setSignerConnected] = useState(false)
  let [isLoading] = useState(false);


  useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await checkConnection();
        setSignerConnected(connected)
      } catch (err) {
        console.log(err)
      }
    }, 100);
    if (signerConnected) {
      let res = getActiveKeyFromSigner()
      localStorage.setItem("Address", res)
      props.setActivePublicKey(res)
    }
    window.addEventListener('signer:connected', msg => {
      setSignerLocked(!msg.detail.isUnlocked)
      setSignerConnected(true)
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:disconnected', msg => {
      setSignerLocked(!msg.detail.isUnlocked)
      setSignerConnected(false)
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:tabUpdated', msg => {
      setSignerLocked(!msg.detail.isUnlocked)
      setSignerConnected(msg.detail.isConnected)
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:activeKeyChanged', msg => {
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:locked', msg => {
      setSignerLocked(!msg.detail.isUnlocked);
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:unlocked', msg => {
      setSignerLocked(!msg.detail.isUnlocked)
      setSignerConnected(msg.detail.isConnected)
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
    window.addEventListener('signer:initialState', msg => {
      console.log("Initial State: ", msg.detail);

      setSignerLocked(!msg.detail.isUnlocked)
      setSignerConnected(msg.detail.isConnected)
      localStorage.setItem("Address", msg.detail.activeKey)
      props.setActivePublicKey(msg.detail.activeKey)
    });
// eslint-disable-next-line
  }, []);


  async function checkConnection() {

    try {
      return await Signer.isConnected();
    }
    catch {
      let variant = "Error";
      enqueueSnackbar('Unable to connect', { variant });
    }
  }

  async function getActiveKeyFromSigner() {
    try {
      return await Signer.getActivePublicKey();
    }
    catch {
      let variant = "Error";
      enqueueSnackbar('Unable to get Active Public Key', { variant });
    }

  }
  async function connectToSigner() {

    try {
      return await Signer.sendConnectionRequest();
    }
    catch {
      let variant = "Error";
      enqueueSnackbar('Unable to send Connection Request', { variant });
    }
  }


  const selectedStyling = {
    border: "2px solid '#ed0b25'",
    padding: "10px 20px",
    borderRadius: "5px",
    color: '#FFF',
    backgroundColor: '#ed0b25'
  };
  const defaultStyling = {
    // border: "2px solid #ed0b25",
    padding: "10px 20px",
    borderRadius: "5px",
    // color: '#FFF',
    // backgroundColor: "#000"
  };
  const selectedNavStyle = {
    Swap: props.selectedNav === "Swap" ? selectedStyling : defaultStyling,
    Pool: props.selectedNav === "Pool" ? selectedStyling : defaultStyling,
    Tokens: props.selectedNav === "Tokens" ? selectedStyling : defaultStyling,
    Home: props.selectedNav === "Home" ? selectedStyling : defaultStyling,
    Pairs: props.selectedNav === "pairs" ? selectedStyling : defaultStyling,
  };

  let Disconnect = (e) => {
    console.log("akjdf");
    Cookies.remove("Authorization");
    localStorage.removeItem("Address")
    props.setActivePublicKey("")
    try {
      Signer.disconnectFromSite()
    }
    catch {
      let variant = "Error";
      enqueueSnackbar('Unable to Disconnect', { variant });
    }

    window.location.reload();
    // setTimeout(() => { }, 1);
  };

  return (
    <header className={`header ${menuOpenedClass}`}>
      <nav
        className="navbar navbar-expand-lg header-nav"
        style={{ width: "100%" }}
      >
        <div className="navbar-header">
          <a
            id="mobile_btn"
            href="/"
            style={{ color: "#ed0b25" }}
            onClick={(e) => {
              e.preventDefault();
              setMenuOpenedClass("menu-opened");
            }}
          >
            <span className="bar-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </a>

          <Link style={{ color: '#ed0b25' }} to="/" className="navbar-brand logo">
            <img src={Logo} alt="Logo" width="50" />
            {/* Casper Swap */}
          </Link>

          {/* <Link style={{ color: '#ed0b25' }} to="/kyc" className="navbar-brand">
            KYC
          </Link> */}
        </div>

        <div className="main-menu-wrapper">
          <div className="menu-header">
            {/* <a style={{ color: '#ed0b25' }} href="/" className="menu-logo">
              <img src={Logo} alt="Logo" width="100" height="60" />
            </a> */}
            <a
              id="menu_close"
              className="menu-close"
              style={{ color: '#ed0b25' }}
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpenedClass("");
              }}
            >
              <i className="fas fa-times"></i>
              {" "}Close
            </a>
          </div>
          <ul
            className="main-nav "
            style={{
              marginTop: "4px",
            }}
          >
            <li className="login-link ">
              <a
                href="/"
                style={{ paddingLeft: "5px" }}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpenedClass("");
                }}
              >
                <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
              </a>
            </li>
            <li className="login-link ">
              {/* <Link to="/dashboard" style={{ color: '#ed0b25' }} > */}

              {localStorage.getItem("Address") && localStorage.getItem("Address") !== null && localStorage.getItem("Address") !== 'null' ? (
                <a href={"https://ropsten.etherscan.io/address/" + localStorage.getItem("Address")} target="_blank" rel="noopener noreferrer" style={{ color: '#ed0b25' }}>
                  <span style={{ cursor: 'pointer' }}>{localStorage.getItem("Address").substr(0, 10)}. . .</span>
                </a>
              ) : (signerLocked && signerConnected ? (
                <>
                  <Button variant="primary"
                    onClick={async () => {
                      await connectToSigner();
                    }}
                  >
                    Unlock Signer
                  </Button>

                </>
              ) : (
                <>
                  <Button variant="primary"
                    onClick={async () => {
                      await connectToSigner()
                    }}
                  >
                    Connect to Signer
                  </Button>
                </>
              )
              )}
              {/* </Link> */}
            </li>
            <li>
              <a href="/" style={{ color: '#ed0b25' }} >
                <span style={selectedNavStyle.Home}>
                  Home
                </span>
              </a>
            </li>
            <li>
              <Link to="/swap" style={{ color: '#ed0b25' }} >
                <span style={selectedNavStyle.Swap}>
                  Swap
                </span>
              </Link>
            </li>
            <li>
              <Link to="/pool" style={{ color: '#ed0b25' }} >
                <span style={selectedNavStyle.Pool}>
                  Pool
                </span>
              </Link>
            </li>
            <li>
              <Link to="/tokens" style={{ color: '#ed0b25' }} >
                <span style={selectedNavStyle.Tokens}>
                  Tokens
                </span>
              </Link>
            </li>
            <li>
              <Link to="/pairs" style={{ color: '#ed0b25' }} >
                <span style={selectedNavStyle.Pairs}>
                  Pairs
                </span>
              </Link>
            </li>

          </ul>
        </div>
        <ul className="nav header-navbar-rht">
          <li >{isLoading ? (
            <div className="text-center">
              <Spinner
                animation="border"
                role="status"
                style={{ color: "e84646" }}
              >
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          ) : (
            localStorage.getItem("Address") && localStorage.getItem("Address") !== null && localStorage.getItem("Address") !== 'null' ? (
              <a href={"https://ropsten.etherscan.io/address/" + localStorage.getItem("Address")} target="_blank" rel="noopener noreferrer" style={{ color: '#ed0b25' }}>
                <span style={{ cursor: 'pointer' }}>{localStorage.getItem("Address").substr(0, 10)}. . .</span>
              </a>
            ) : (signerLocked && signerConnected ? (
              <>
                <Button variant="primary"
                  onClick={async () => {
                    await connectToSigner();
                  }}
                >
                  Unlock Signer
                </Button>

              </>
            ) : (
              <>
                <Button variant="primary"
                  onClick={async () => {
                    await connectToSigner()
                  }}
                >
                  Connect to Signer
                </Button>
              </>
            ))
          )}

          </li>
          <li>
            {localStorage.getItem("Address") && localStorage.getItem("Address") !== null && localStorage.getItem("Address") !== 'null' ? (
              <span style={{ cursor: 'pointer' }} onClick={() => Disconnect()}>
                Disconnect
              </span>
            ) : (null)}
          </li>
        </ul>
      </nav>
    </header >
  );
}

export default HeaderHome;
