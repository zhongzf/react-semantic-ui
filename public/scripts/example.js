/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Comment = React.createClass({
  rawMarkup: function () {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  },

  render: function () {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup() } />
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function (comment) {
    var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({ data: newComments });
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({ data: comments });
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function () {
    return { data: [] };
  },
  componentDidMount: function () {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function () {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function () {
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function () {
    return { author: '', text: '' };
  },
  handleAuthorChange: function (e) {
    this.setState({ author: e.target.value });
  },
  handleTextChange: function (e) {
    this.setState({ text: e.target.value });
  },
  handleSubmit: function (e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({ author: author, text: text });
    this.setState({ author: '', text: '' });
  },
  render: function () {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
          />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
          />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

/*********************************************************************************************/

var UIButton = React.createClass({
  render: function () {
    return (
      <div className="ui button">{this.props.children}</div>
    );
  }
});

var UIInput = React.createClass({
  render: function () {
    return (
      <div className="ui input">
        <input type={this.props.type} placeholder={this.props.placeholder} />
      </div>
    );
  }
});

var UILabel = React.createClass({
  render: function () {
    return (
      <div className="ui label">
        <i className={this.props.icon + " icon"}></i>{this.props.children}
      </div>
    );
  }
});

var UIBreadcrumb = React.createClass({
  render: function () {
    var contents = [];
    for (var i = 0; i < this.props.data.length; i++) {
      contents.push(<a key={'section' + i} className="section">{this.props.data[i]}</a>);
      if (i < this.props.data.length - 1) {
        contents.push(<div key={'divider' + i} className="divider"> / </div>);
      }
    }
    return (
      <div className="ui breadcrumb">
        {contents}
      </div>
    );
  }
});

var UIAccordionItem = React.createClass({
  render: function () {
  }
});

var UIAccordion = React.createClass({
  componentDidMount: function () {
    $(this.refs.accordion).accordion();
  },
  componentWillUnmount: function () {
    // Clean up work here.
  },
  shouldComponentUpdate: function () {
    // Let's just never update this component again.
    return false;
  },
  render: function () {
    var childrenTitles = React.Children.map(this.props.children, function (element, index) {
      return (
        <div key={'title' + index} className="title">
          <i className="dropdown icon"></i>
          {element.props.title}
        </div>
      );
    });
    var childrenContents = React.Children.map(this.props.children, function (element, index) {
      return (
        <div key={'content' + index}  className="content">
          <p>{element.props.children}</p>
        </div>
      );
    });
    var contents = [];
    for (var i = 0; i < childrenTitles.length; i++) {
      contents.push(childrenTitles[i]);
      contents.push(childrenContents[i]);
    }
    return (
      <div ref="accordion" className="ui styled accordion">
        {contents}
      </div>
    );
  }
});
/*********************************************************************************************/

var breadcrumbData = ["Home", "Store", "T-Shirt"];

ReactDOM.render(
  <div>
    <UIButton>Follow</UIButton>
    <UIInput type="text" placeholder="Search..." />
    <UILabel icon="mail"> 23</UILabel>
    <UIBreadcrumb data={breadcrumbData} />
    <UIAccordion>
      <UIAccordionItem title="What is a dog?">
        <p>A dog is a type of domesticated animal.Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.</p>
      </UIAccordionItem>
      <UIAccordionItem title="What kinds of dogs are there?">
        <p>There are many breeds of dogs.Each breed varies in size and temperament.Owners often select a breed of dog that they find to be compatible with their own lifestyle and desires from a companion.</p>
      </UIAccordionItem>
      <UIAccordionItem title="How do you acquire a dog?">
        <p>Three common ways for a prospective owner to acquire a dog is from pet shops, private owners, or shelters.</p>
        <p>A pet shop may be the most convenient way to buy a dog. Buying a dog from a private owner allows you to assess the pedigree and upbringing of your dog before choosing to take it home. Lastly, finding your dog from a shelter, helps give a good home to a dog who may not find one so readily.</p>
      </UIAccordionItem>
    </UIAccordion>
  </div>,
  document.getElementById('content')
);
