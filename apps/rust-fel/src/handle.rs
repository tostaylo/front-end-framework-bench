use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug, Default, Clone)]
pub struct Handle<T>(pub Rc<RefCell<T>>);
