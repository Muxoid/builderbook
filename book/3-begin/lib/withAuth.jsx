import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

let globalUser = null;

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false } = {},
) {
  const propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      isAdmin: PropTypes.bool,
    }),
    isFromServer: PropTypes.bool.isRequired,
  };

  const defaultProps = {
    user: null,
  };

  class App extends React.Component {
    static async getInitialProps(ctx) {
      // 1. getInitialProps
      const isFromServer = typeof window === 'undefined';
      const user = ctx.req ? ctx.req.user && ctx.req.user.toObject() : globalUser;

      if (isFromServer && user) {
        user._id = user._id.toString();
      }

      const props = { user, isFromServer };

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { user, isFromServer } = this.props;

      if (isFromServer) {
        globalUser = user;
      }

      /*if (loginRequired && !logoutRequired && !user) {
        Router.push('/public/login', '/login');
        return;
      }
*/
      if (logoutRequired && user) {
        Router.push('/');
      }
    }
    render() {
      // 3. render
      const { user } = this.props;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return (
        <>
          <BaseComponent {...this.props} />
        </>
      );
    }
  }

  App.propTypes = propTypes;
  App.defaultProps = defaultProps;

  return App;
}
