import './Profile.scss';

import { useQuery } from '@apollo/client';
import isJwtTokenExpired from 'jwt-check-expiry';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Image } from 'semantic-ui-react';

import AvatarNoFound from '../../../assets/png/avatar.png';
import { GET_USER } from '../../../gql/user';
import userAuth from '../../../hooks/useAuth';
import { getToken, removeToken } from '../../../utils/token';
import ModalBasic from '../../Modal/ModalBasic/ModalBasic';
import UserNotFound from '../../UserNotFound';
import AvatarForm from '../AvatarForm';
import SettingsForm from '../SettingsForm/SettingsForm';
import HeaderProfile from './HeaderProfile';

export default function Profile(props) {

    let navigate = useNavigate();
    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/");
        } else {
            // verificamos que el token no a expirado
            const tokenValido = isJwtTokenExpired(token);
            if (tokenValido) {
                removeToken();
                navigate("/");
            }
        }
    }, []);


    // la varianle username seria el usuario que estamos visualizando
    const { username } = props;
    const [showModal, setShowModal] = useState(false);
    const [titleModal, setTitleModal] = useState("");
    const [childenModal, setChildrenModal] = useState(null);
    // en auth hay un username pero del usuario logueado
    const { auth } = userAuth();

    const { data, loading, error, refetch } = useQuery(GET_USER, {
        variables: {
            username,
        },
    });
    if (loading) return null;
    if (error) return <UserNotFound />;
    // getUser tambien tiene username del usuario que se esta visualizando
    const { getUser } = data;
   
    //console.log(getUser);
    //console.log(auth);
     

    const handlerModal = (type) => {
        switch (type) {
            case "avatar":
                setTitleModal("Cambiar Foto De Perfil");
                setChildrenModal(
                    <AvatarForm
                        setShowModal={setShowModal}
                        auth={auth}
                    ></AvatarForm>
                );
                setShowModal(true);
                break;
            case "settings":
                setTitleModal("");
                setChildrenModal(
                    <SettingsForm
                        setShowModal={setShowModal}
                        setTitleModal={setTitleModal}
                        setChildrenModal={setChildrenModal}
                        getUser={getUser}
                        refetch={refetch}
                    />
                );
                setShowModal(true);
                break;

            default:
                break;
        }
    };



    

    return (
        <>
            <Grid className="profile">
                <Grid.Column width={5} className="profile__left">
                    <Image
                        src={getUser.avatar ? getUser.avatar : AvatarNoFound}
                        avatar
                        onClick={() =>
                            username === auth.username && handlerModal("avatar")
                        }
                    ></Image>
                </Grid.Column>
                <Grid.Column width={11} className="profile__right">
                    
                    <HeaderProfile
                        auth={auth}
                        getUser={getUser}
                        handlerModal={handlerModal}
                    ></HeaderProfile>

                    <div>Followers</div>
                    <div className="other">
                        <p className="name">{getUser.name}</p>
                        {getUser.siteWeb && (
                            <a href={getUser.siteWeb} className="siteWeb">
                                {getUser.siteWeb}
                            </a>
                        )}
                        {getUser.description && (
                            <p className="description">{getUser.description}</p>
                        )}
                    </div>
                </Grid.Column>
            </Grid>
            <ModalBasic
                show={showModal}
                setShow={setShowModal}
                title={titleModal}
            >
                {childenModal}
            </ModalBasic>
        </>
    );
}
