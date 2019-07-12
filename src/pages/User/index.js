import React, { Component } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    page: 1,
    loading: false,
    loadingMore: false,
    refreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const { page } = this.state;

    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({ stars: response.data, loading: false });
  }

  loadMore = async () => {
    const { page, stars, loadingMore } = this.state;
    const { navigation } = this.props;

    if (loadingMore) {
      return;
    }

    this.setState({ loadingMore: true });

    const nextPage = page + 1;
    const user = navigation.getParam('user');

    const { data } = await api.get(
      `/users/${user.login}/starred?page=${nextPage}`
    );

    this.setState({
      stars: [...stars, ...data],
      page: nextPage,
      loadingMore: false,
    });
  };

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const page = 1;

    this.setState({ refreshing: true });

    const { data } = await api.get(`/users/${user.login}/starred?page=${page}`);

    this.setState({
      stars: data,
      page,
      refreshing: false,
    });
  };

  goToRepository = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#7159c1" />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReached={this.loadMore}
            onEndReachedThreshold={0.2}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => this.goToRepository(item)}>
                <Starred>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableOpacity>
            )}
          />
        )}
      </Container>
    );
  }
}
